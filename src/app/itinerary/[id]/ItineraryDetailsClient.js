"use client";

import { useState } from "react";
import { 
  toggleVote, 
  toggleVerification, 
  addComment 
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
  ExternalLink
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";

export default function ItineraryDetailsClient({ initialItinerary, currentUserId }) {
  const { isLoaded, userId } = useAuth();
  const [itinerary, setItinerary] = useState(initialItinerary);
  const [commentContent, setCommentContent] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  
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

  // 4. Zapin Export Simulator
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
            if (type === "pdf") {
              // Simulating actual PDF download
              alert("Zapin: Your interactive PDF Pack has been downloaded successfully!");
            } else {
              alert("Zapin: Sync completed! Events added to your calendar application.");
            }
          }, 1500);
          return 100;
        }
        return oldProgress + 20;
      });
    }, 300);
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
    md += `*Itinerary formatted using [Zapin Itinerary Hub](https://zapin.web). Click here to [verify this itinerary, add comments, or export it directly to your calendar via Zapin](https://zapin.web/itinerary/${itinerary.id}).*`;
    
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
                    <div className="activity-time">{act.time}</div>
                    <div style={{ fontWeight: "700", marginBottom: "0.25rem" }}>{act.activity}</div>
                    {act.notes && <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{act.notes}</div>}
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
              itinerary.comments.map((comm) => (
                <div key={comm.id} className="comment-card">
                  {comm.author_image ? (
                    <img src={comm.author_image} alt={comm.author_name} className="comment-author-avatar" />
                  ) : (
                    <div className="comment-author-avatar" style={{ background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "0.8rem" }}>
                      {comm.author_name.charAt(0)}
                    </div>
                  )}
                  <div className="comment-details">
                    <div className="comment-meta">
                      <span className="comment-author-name">{comm.author_name}</span>
                      <span>{new Date(comm.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="comment-content">{comm.content}</p>
                  </div>
                </div>
              ))
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

        {/* Zapin Integration Box */}
        <div className="sidebar-box" style={{ background: "linear-gradient(135deg, #1e1b4b, #2b1102)", borderColor: "rgba(249, 115, 22, 0.3)" }}>
          <h4 style={{ color: "#ffedd5", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <Sparkles size={18} style={{ color: "var(--zapin)" }} /> Export with Zapin
          </h4>
          <p style={{ fontSize: "0.85rem", color: "#fed7aa", marginBottom: "1.5rem" }}>
            Use our sponsor product <strong>Zapin</strong> to instantly sync dates to calendars, verify checklist details, and package offline sheets.
          </p>

          {zapinExporting ? (
            <div style={{ color: "white", padding: "1rem 0" }}>
              <div style={{ fontSize: "0.85rem", marginBottom: "0.5rem", color: "#ffedd5" }}>
                {zapinFinished ? "Done! Opening download..." : `Zapin is processing: ${zapinProgress}%`}
              </div>
              <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${zapinProgress}%`, height: "100%", background: "var(--zapin)", transition: "width 0.3s ease" }}></div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button 
                onClick={() => triggerZapinExport("calendar")}
                className="btn btn-zapin" 
                style={{ width: "100%", justifyContent: "center" }}
              >
                <CalendarPlus size={16} /> Sync to My Calendar
              </button>
              <button 
                onClick={() => triggerZapinExport("pdf")}
                className="btn btn-secondary" 
                style={{ width: "100%", justifyContent: "center", color: "white", borderColor: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)" }}
              >
                <Download size={16} /> Download Travel PDF
              </button>
            </div>
          )}
        </div>

        {/* Reddit Sharing Box */}
        <div className="sidebar-box">
          <h4 style={{ marginBottom: "1rem", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Share2 size={18} style={{ color: "#ff4500" }} /> Reddit Share
          </h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
            Format this itinerary to paste in subreddits or submit a review request link.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
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
      </div>
    </div>
  );
}
