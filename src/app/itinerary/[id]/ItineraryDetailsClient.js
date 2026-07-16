"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  toggleVote, 
  toggleVerification, 
  addComment,
  deleteItinerary
} from "../../actions";
import { 
  ThumbsUp, 
  ThumbsDown, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  ShieldCheck, 
  Sparkles, 
  CalendarPlus, 
  Download, 
  Send,
  MessageSquare,
  BadgeAlert,
  Share2,
  ExternalLink,
  Link2,
  Reply,
  CornerDownRight
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";

// Utility helper to format HH:MM 24h clock strings to AM/PM display
const formatTime = (timeStr) => {
  if (!timeStr) return "";
  // Check if it already has AM/PM (like our seeded mock data)
  if (timeStr.toLowerCase().includes("am") || timeStr.toLowerCase().includes("pm")) {
    return timeStr;
  }
  // Convert 24h HH:MM to 12h AM/PM
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    return `${hours}:${minutes} ${ampm}`;
  }
  return timeStr;
};

export default function ItineraryDetailsClient({ initialItinerary, currentUserId }) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [itinerary, setItinerary] = useState(initialItinerary);
  const [commentContent, setCommentContent] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  
  // Zapin simulated states
  const [zapinExporting, setZapinExporting] = useState(null); // 'calendar' | 'pdf' | null
  const [zapinProgress, setZapinProgress] = useState(0);
  const [zapinFinished, setZapinFinished] = useState(false);

  // Voting metrics calculations
  const upvotes = itinerary.votes?.filter((v) => v.vote_type === "upvote") || [];
  const downvotes = itinerary.votes?.filter((v) => v.vote_type === "downvote") || [];
  const score = upvotes.length - downvotes.length;
  
  const userVote = itinerary.votes?.find((v) => v.user_id === currentUserId)?.vote_type || null;

  // Verification calculations
  const realVerifications = itinerary.verifications?.filter((v) => v.is_real) || [];
  const accurateVerifications = itinerary.verifications?.filter((v) => v.is_accurate) || [];
  
  const userVerification = itinerary.verifications?.find((v) => v.user_id === currentUserId) || {
    is_real: false,
    is_accurate: false
  };

  // 1. Handle Vote Action
  const handleVote = async (type) => {
    if (!currentUserId) {
      alert("Please sign in to vote!");
      return;
    }

    // Optimistic Update
    const originalVotes = [...(itinerary.votes || [])];
    let newVotes = [...originalVotes];
    const existingIdx = newVotes.findIndex((v) => v.user_id === currentUserId);

    if (existingIdx > -1) {
      if (newVotes[existingIdx].vote_type === type) {
        newVotes.splice(existingIdx, 1); // remove
      } else {
        newVotes[existingIdx].vote_type = type; // change
      }
    } else {
      newVotes.push({ user_id: currentUserId, vote_type: type });
    }

    setItinerary({ ...itinerary, votes: newVotes });

    const result = await toggleVote(itinerary.id, type);
    if (!result.success) {
      // rollback
      setItinerary({ ...itinerary, votes: originalVotes });
      alert(result.error || "Failed to submit vote");
    }
  };

  // 2. Handle Verification Toggle
  const handleVerify = async (metric) => {
    if (!currentUserId) {
      alert("Please sign in to verify this itinerary!");
      return;
    }

    // Optimistic Update
    const originalVerifications = [...(itinerary.verifications || [])];
    let newVerifications = [...originalVerifications];
    let ver = newVerifications.find((v) => v.user_id === currentUserId);

    if (!ver) {
      ver = { user_id: currentUserId, is_real: false, is_accurate: false };
      newVerifications.push(ver);
    }

    if (metric === "real") ver.is_real = !ver.is_real;
    if (metric === "accurate") ver.is_accurate = !ver.is_accurate;

    setItinerary({ ...itinerary, verifications: newVerifications });

    const result = await toggleVerification(itinerary.id, metric);
    if (!result.success) {
      setItinerary({ ...itinerary, verifications: originalVerifications });
      alert(result.error || "Failed to update verification");
    }
  };

  // 3. Comment Submit
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUserId) return;
    if (!commentContent.trim()) return;

    setIsCommenting(true);
    const result = await addComment(itinerary.id, commentContent);
    setIsCommenting(false);

    if (result.success) {
      setCommentContent("");
      // Fetch fresh details to display new comment (or append optimistically)
      // Since Server Action revalidates, we can append locally too or wait. Let's do local append to avoid full refresh delays:
      const newComment = {
        id: `local-${Date.now()}`,
        author_name: "You",
        author_image: "",
        content: commentContent,
        created_at: new Date().toISOString()
      };
      setItinerary({
        ...itinerary,
        comments: [newComment, ...(itinerary.comments || [])]
      });
    } else {
      alert(result.error || "Failed to post comment");
    }
  };

  // 3b. Reply Submit
  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();
    if (!currentUserId) return;
    if (!replyContent.trim()) return;

    setIsReplying(true);
    const result = await addComment(itinerary.id, replyContent, parentId);
    setIsReplying(false);

    if (result.success) {
      setReplyContent("");
      setReplyingToId(null);
      
      const newReply = {
        id: `local-${Date.now()}`,
        author_name: "You",
        author_image: "",
        content: replyContent,
        parent_id: parentId,
        created_at: new Date().toISOString()
      };
      setItinerary({
        ...itinerary,
        comments: [newReply, ...(itinerary.comments || [])]
      });
    } else {
      alert(result.error || "Failed to post reply");
    }
  };

  // 4. zapin.fun Album Creation Simulator
  const triggerZapinExport = (type) => {
    setZapinExporting(type);
    setZapinProgress(0);
    setZapinFinished(false);

    const interval = setInterval(() => {
      setZapinProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(interval);
          setZapinFinished(true);
          setTimeout(() => {
            setZapinExporting(null);
            if (type === "album") {
              alert("zapin.fun: Group photo album created successfully! Share the join link with your friends to collect trip photos automatically with zero manual sorting.");
              window.open("https://zapin.fun", "_blank");
            }
          }, 1500);
          return 100;
        }
        return oldProgress + 20;
      });
    }, 300);
  };

  // 4b. Delete Itinerary Handler
  const handleDeleteItinerary = async () => {
    if (!confirm("Are you sure you want to permanently delete this itinerary? This action cannot be undone.")) {
      return;
    }
    
    const result = await deleteItinerary(itinerary.id);
    if (result.success) {
      alert("Itinerary deleted successfully.");
      router.push("/explore");
    } else {
      alert(result.error || "Failed to delete itinerary.");
    }
  };

  // 5. Copy Reddit Markdown
  const copyRedditMarkdown = () => {
    let md = `# Travel Itinerary: ${itinerary.title} (${itinerary.duration_days} Days in ${itinerary.location})\n\n`;
    md += `**Budget Level**: ${itinerary.budget}\n\n`;
    md += `> ${itinerary.description}\n\n`;
    md += `## Schedule Details:\n\n`;
    
    itinerary.content?.days?.forEach((day) => {
      md += `### Day ${day.day}: ${day.title}\n`;
      day.activities?.forEach((act) => {
        md += `* **${act.time}** - ${act.activity} ${act.notes ? `(*${act.notes}*)` : ""}\n`;
      });
      md += `\n`;
    });
    
    md += `---\n`;
    md += `*Itinerary formatted using [Roam Itinerary Hub](https://zapin.fun). Click here to [explore this itinerary, verify community routes, and share group travel photos with family & friends via zapin.fun](https://zapin.fun/itinerary/${itinerary.id}).*`;
    
    navigator.clipboard.writeText(md);
    alert("Reddit-formatted Markdown copied to clipboard!");
  };

  // 6. Share to Reddit
  const shareToReddit = () => {
    const title = encodeURIComponent(`Travel Itinerary: ${itinerary.duration_days} Days in ${itinerary.location}`);
    const text = encodeURIComponent(
      `Check out my full day-by-day travel schedule here: ${window.location.origin}/itinerary/${itinerary.id}\n\n` +
      `Feedback, votes, and verifications are appreciated!`
    );
    window.open(`https://www.reddit.com/submit?title=${title}&text=${text}`, "_blank");
  };

  // 7. Copy Shareable Link
  const copyShareableLink = () => {
    const link = `${window.location.origin}/itinerary/${itinerary.id}`;
    navigator.clipboard.writeText(link);
    alert("Shareable link copied to clipboard!");
  };

  return (
    <div className="detail-layout">
      {/* Main Details */}
      <div className="itinerary-detail-content">
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.25rem", marginBottom: "1rem" }}>{itinerary.title}</h1>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", color: "var(--text-muted)", fontSize: "0.95rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <MapPin size={18} /> {itinerary.location}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Calendar size={18} /> {itinerary.duration_days} Days
            </span>
            <span className="badge badge-budget" style={{ fontSize: "0.85rem" }}>
              {itinerary.budget}
            </span>
          </div>
        </div>

        <p style={{ fontSize: "1.1rem", lineHeight: "1.7", color: "var(--text-muted)", marginBottom: "2.5rem" }}>
          {itinerary.description}
        </p>

        <h2 style={{ fontFamily: "var(--font-title)", marginBottom: "1.5rem", borderBottom: "2px solid var(--surface-border)", paddingBottom: "0.5rem" }}>
          Day-by-Day Schedule
        </h2>

        {/* Timeline View */}
        <div className="timeline">
          {itinerary.content?.days?.map((day, idx) => (
            <div key={idx} className="timeline-day">
              <div className="timeline-dot"></div>
              <h3 className="day-header">
                Day {day.day}: {day.title}
              </h3>
              <div>
                {day.activities?.map((act, actIdx) => (
                  <div key={actIdx} className="activity-card">
                    <div className="activity-time">{formatTime(act.time)}</div>
                    <div style={{ fontWeight: "700", marginBottom: "0.25rem" }}>{act.activity}</div>
                    {act.notes && <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>{act.notes}</div>}
                    
                    {/* Maps & Website Links */}
                    {(act.mapLink || act.siteUrl) && (
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                        {act.mapLink && (
                          <a 
                            href={act.mapLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="activity-link-badge maps"
                          >
                            <MapPin size={12} /> Google Maps
                          </a>
                        )}
                        {act.siteUrl && (
                          <a 
                            href={act.siteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="activity-link-badge web"
                          >
                            <ExternalLink size={12} /> Website
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <h2 style={{ fontFamily: "var(--font-title)", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MessageSquare size={24} /> Discussion ({itinerary.comments?.length || 0})
          </h2>

          {currentUserId ? (
            <form onSubmit={handleCommentSubmit} style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
              <input
                type="text"
                placeholder="Share feedback, question, or verification details..."
                className="form-control"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                required
              />
              <button type="submit" disabled={isCommenting} className="btn btn-primary" style={{ flexShrink: 0 }}>
                {isCommenting ? "Sending..." : <><Send size={16} /> Send</>}
              </button>
            </form>
          ) : (
            <div style={{ padding: "1rem", background: "var(--background)", borderRadius: "var(--radius-sm)", marginBottom: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Please sign in to join the conversation and leave a comment.
            </div>
          )}

          <div>
            {(itinerary.comments || []).length === 0 ? (
              <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>
                No comments yet. Be the first to ask a question!
              </div>
            ) : (
              (() => {
                const parentComments = (itinerary.comments || []).filter((c) => !c.parent_id);
                const commentReplies = (itinerary.comments || []).filter((c) => c.parent_id);

                return parentComments.map((comm) => {
                  const repliesForThisComment = commentReplies.filter((r) => r.parent_id === comm.id);

                  return (
                    <div key={comm.id} style={{ marginBottom: "2.5rem" }}>
                      {/* Main Parent Comment */}
                      <div className="comment-card" style={{ marginBottom: "0.5rem" }}>
                        {comm.author_image ? (
                          <img src={comm.author_image} alt={comm.author_name} className="comment-author-avatar" />
                        ) : (
                          <div className="comment-author-avatar" style={{ background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-inverse)", fontWeight: "bold", fontSize: "0.8rem" }}>
                            {comm.author_name.charAt(0)}
                          </div>
                        )}
                        <div className="comment-details">
                          <div className="comment-meta">
                            <span className="comment-author-name">{comm.author_name}</span>
                            <span>{new Date(comm.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="comment-content">{comm.content}</p>
                          
                          {/* Reply Button Trigger */}
                          {currentUserId && (
                            <button
                              onClick={() => {
                                setReplyingToId(replyingToId === comm.id ? null : comm.id);
                                setReplyContent("");
                              }}
                              style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "0.75rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer", marginTop: "0.5rem", padding: 0 }}
                            >
                              <Reply size={12} /> Reply
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Inline Reply Form */}
                      {replyingToId === comm.id && (
                        <form 
                          onSubmit={(e) => handleReplySubmit(e, comm.id)} 
                          style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", marginLeft: "2.5rem", width: "calc(100% - 2.5rem)" }}
                        >
                          <input
                            type="text"
                            placeholder={`Reply to ${comm.author_name}...`}
                            className="form-control"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            required
                            autoFocus
                            style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}
                          />
                          <button type="submit" disabled={isReplying} className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>
                            Send
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={() => setReplyingToId(null)}
                            style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
                          >
                            Cancel
                          </button>
                        </form>
                      )}

                      {/* Replies List */}
                      {repliesForThisComment.length > 0 && (
                        <div style={{ marginLeft: "2.5rem", marginTop: "0.75rem", borderLeft: "2px solid var(--surface-border)", paddingLeft: "1.25rem" }}>
                          {repliesForThisComment.map((reply) => (
                            <div key={reply.id} className="comment-card" style={{ marginBottom: "1rem", borderBottom: "none", paddingBottom: 0 }}>
                              {reply.author_image ? (
                                <img src={reply.author_image} alt={reply.author_name} className="comment-author-avatar" style={{ width: "24px", height: "24px" }} />
                              ) : (
                                <div className="comment-author-avatar" style={{ width: "24px", height: "24px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "0.7rem" }}>
                                  {reply.author_name.charAt(0)}
                                </div>
                              )}
                              <div className="comment-details">
                                <div className="comment-meta">
                                  <span className="comment-author-name" style={{ fontSize: "0.85rem" }}>{reply.author_name}</span>
                                  <span style={{ fontSize: "0.75rem" }}>{new Date(reply.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="comment-content" style={{ fontSize: "0.9rem" }}>{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                });
              })()
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Panel */}
      <div className="detail-sidebar">
        {/* Rating Box */}
        <div className="sidebar-box">
          <h4 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Helpful Guide?</h4>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button 
              onClick={() => handleVote("upvote")} 
              className={`btn btn-secondary ${userVote === "upvote" ? "active-up" : ""}`}
              style={{ flex: 1, justifyContent: "center" }}
            >
              <ThumbsUp size={16} /> Upvote ({upvotes.length})
            </button>
            <button 
              onClick={() => handleVote("downvote")} 
              className={`btn btn-secondary ${userVote === "downvote" ? "active-down" : ""}`}
              style={{ flex: 1, justifyContent: "center" }}
            >
              <ThumbsDown size={16} /> Down ({downvotes.length})
            </button>
          </div>
          <div style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Total rating score: <strong>{score}</strong>
          </div>
        </div>

        {/* Verification Badges */}
        <div className="sidebar-box">
          <h4 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Community Trust Verification</h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
            Help other travelers verify this itinerary by confirming accuracy and experience.
          </p>

          <div className="trust-votes">
            <button 
              onClick={() => handleVerify("real")}
              className={`trust-vote-btn ${userVerification.is_real ? "active-real" : ""}`}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShieldCheck size={18} style={{ color: "var(--success)" }} /> This trip is REAL
              </span>
              <span>{realVerifications.length} votes</span>
            </button>

            <button 
              onClick={() => handleVerify("accurate")}
              className={`trust-vote-btn ${userVerification.is_accurate ? "active-accurate" : ""}`}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle size={18} style={{ color: "var(--warning)" }} /> Accurate schedules
              </span>
              <span>{accurateVerifications.length} votes</span>
            </button>
          </div>
        </div>

        {/* zapin.fun Integration Box */}
        <div className="sidebar-box" style={{ background: "linear-gradient(135deg, #1e1b4b, #11022b)", borderColor: "rgba(218, 248, 113, 0.2)" }}>
          <h4 style={{ color: "#ffffff", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", fontFamily: "var(--font-title)" }}>
            <Sparkles size={18} style={{ color: "var(--zapin)" }} /> Share on zapin.fun
          </h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem", lineHeight: "1.5" }}>
            Roam is proud to be sponsored by <strong>zapin.fun</strong>—the ultimate app-only platform to share group travel photos with friends and family during your trip with ease, and with zero manual sorting!
          </p>

          {zapinExporting ? (
            <div style={{ color: "white", padding: "1rem 0" }}>
              <div style={{ fontSize: "0.85rem", marginBottom: "0.5rem", color: "var(--primary)" }}>
                {zapinFinished ? "Done! Opening zapin.fun..." : `zapin.fun is creating group album: ${zapinProgress}%`}
              </div>
              <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${zapinProgress}%`, height: "100%", background: "var(--zapin)", transition: "width 0.3s ease" }}></div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button 
                onClick={() => triggerZapinExport("album")}
                className="btn btn-zapin" 
                style={{ width: "100%", justifyContent: "center" }}
              >
                <Sparkles size={16} /> Create Group Photo Album
              </button>
              <a 
                href="https://zapin.fun" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary" 
                style={{ width: "100%", justifyContent: "center", color: "white", borderColor: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", textDecoration: "none" }}
              >
                <ExternalLink size={16} /> Visit zapin.fun App
              </a>
            </div>
          )}
        </div>

        {/* Reddit Sharing Box */}
        <div className="sidebar-box">
          <h4 style={{ marginBottom: "1rem", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Share2 size={18} style={{ color: "var(--primary)" }} /> Share & Export
          </h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
            Share your travel route with others or format it for subreddits like r/travel.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button 
              onClick={copyShareableLink}
              className="btn btn-primary" 
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Link2 size={16} /> Copy Shareable Link
            </button>
            <button 
              onClick={copyRedditMarkdown}
              className="btn btn-secondary" 
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Share2 size={16} /> Copy Reddit Markdown
            </button>
            <button 
              onClick={shareToReddit}
              className="btn btn-secondary" 
              style={{ width: "100%", justifyContent: "center" }}
            >
              <ExternalLink size={16} /> Post to Reddit
            </button>
          </div>
        </div>

        {/* Owner Management Controls */}
        {currentUserId && currentUserId === itinerary.user_id && (
          <div className="sidebar-box" style={{ borderColor: "rgba(239, 68, 68, 0.25)" }}>
            <h4 style={{ color: "var(--danger)", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", fontFamily: "var(--font-title)", fontSize: "1.1rem" }}>
              <BadgeAlert size={18} /> Manage Itinerary
            </h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
              As the author of this travel guide, you can delete it permanently from the platform.
            </p>
            <button 
              onClick={handleDeleteItinerary}
              className="btn btn-danger" 
              style={{ width: "100%", justifyContent: "center" }}
            >
              Delete Guide
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
