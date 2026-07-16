"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { submitFeedback } from "../actions";
import { MessageSquare, Sparkles, Send, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function FeedbackPage() {
  const { user, isLoaded } = useUser();
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Suggestion");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [warning, setWarning] = useState("");

  // Prepopulate email if user is loaded
  useEffect(() => {
    if (isLoaded && user?.primaryEmailAddress?.emailAddress) {
      setEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [isLoaded, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !content) {
      alert("Please fill in both email and feedback message.");
      return;
    }

    setLoading(true);
    setWarning("");

    const response = await submitFeedback({
      email,
      category,
      content
    });

    setLoading(false);

    if (response.success) {
      setSuccess(true);
      setContent("");
      if (response.warning) {
        setWarning(response.warning);
      }
    } else {
      alert(response.error || "Failed to submit feedback.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "3rem auto", padding: "0 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2rem", fontFamily: "var(--font-title)", fontWeight: "800", letterSpacing: "-0.03em", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          <MessageSquare style={{ color: "var(--primary)" }} /> We're Evolving
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.75rem", lineHeight: "1.6" }}>
          Roam is built for travelers, by travelers. We are constantly shaping our features based on your suggestions. Share your ideas, bug reports, or comments below!
        </p>
      </div>

      {success ? (
        <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: "var(--radius-md)", padding: "2.5rem", textAlign: "center" }}>
          <CheckCircle size={48} style={{ color: "var(--primary)", marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "0.5rem" }}>Thank You!</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "1.5rem" }}>
            Your feedback has been submitted successfully. We review every single submission to guide our future releases.
          </p>
          {warning && (
            <div style={{ padding: "0.75rem", background: "rgba(218, 248, 113, 0.05)", borderRadius: "var(--radius-sm)", border: "1px dashed var(--primary)", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              ⚠️ {warning}
            </div>
          )}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button onClick={() => setSuccess(false)} className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
              Submit More Feedback
            </button>
            <Link href="/explore" className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
              Explore Guides
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="creator-form" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: "var(--radius-md)", padding: "2rem" }}>
          <div className="form-group">
            <label className="form-label">Your Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoaded && !!user}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Suggestion">💡 General Suggestion</option>
              <option value="Feature Request">✨ Feature Request</option>
              <option value="Bug Report">🐛 Bug Report</option>
              <option value="Praise">❤️ Praise / Love</option>
              <option value="Other">❓ Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Suggestions or Comments</label>
            <textarea
              className="form-control"
              rows="6"
              placeholder="What can we improve? What features do you want to see? Let us know here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "0.85rem", marginTop: "1rem" }}
          >
            {loading ? "Submitting..." : (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Send size={16} /> Submit Feedback
              </span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
