"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteItinerary } from "../actions";
import { useUser } from "@clerk/nextjs";
import { MapPin, Calendar, DollarSign, Eye, Edit, Trash2, PlusCircle, ArrowUp } from "lucide-react";

export default function ProfileClient({ initialItineraries }) {
  const { user, isLoaded } = useUser();
  const [itineraries, setItineraries] = useState(initialItineraries);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this itinerary?")) {
      return;
    }

    setDeletingId(id);
    const result = await deleteItinerary(id);
    setDeletingId(null);

    if (result.success) {
      setItineraries(itineraries.filter((it) => it.id !== id));
      alert("Itinerary deleted successfully!");
    } else {
      alert(result.error || "Failed to delete itinerary.");
    }
  };

  if (!isLoaded) {
    return <div style={{ textAlign: "center", padding: "3rem" }}>Loading profile...</div>;
  }

  return (
    <div className="profile-container" style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Profile Header */}
      <div className="profile-card" style={{ display: "flex", alignItems: "center", gap: "1.5rem", background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: "var(--radius-md)", padding: "2rem", marginBottom: "2.5rem" }}>
        {user?.imageUrl ? (
          <img 
            src={user.imageUrl} 
            alt={user.fullName || "User Avatar"} 
            style={{ width: "80px", height: "80px", borderRadius: "50%", border: "2px solid var(--primary)" }} 
          />
        ) : (
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: "bold", color: "var(--text-inverse)" }}>
            {user?.firstName?.charAt(0) || "U"}
          </div>
        )}
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>
            {user?.fullName || "Traveler"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            {user?.primaryEmailAddress?.emailAddress}
          </p>
          <span className="badge badge-real" style={{ marginTop: "0.5rem", display: "inline-block" }}>
            Verified Creator
          </span>
        </div>
      </div>

      {/* Posted Guides Section */}
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "1.5rem", fontFamily: "var(--font-title)", fontWeight: "800" }}>
          My Posted Itineraries
        </h2>
        <Link href="/create" className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
          <PlusCircle size={16} /> Post New
        </Link>
      </div>

      {itineraries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: "var(--radius-md)" }}>
          <MapPin size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
          <h3>You haven't posted any itineraries yet</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0.5rem 0 1.5rem 0" }}>
            Share your travel experiences and help the community verify the best routes.
          </p>
          <Link href="/create" className="btn btn-primary">
            Post Your First Itinerary
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {itineraries.map((it) => (
            <div 
              key={it.id} 
              className="profile-itinerary-card"
              style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: "var(--radius-md)", padding: "1.5rem", transition: "var(--transition)" }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "700", margin: 0 }}>
                    <Link href={`/itinerary/${it.id}`} style={{ color: "white", textDecoration: "none" }}>{it.title}</Link>
                  </h3>
                  <span className="badge badge-budget">{it.budget}</span>
                </div>

                <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><MapPin size={14} /> {it.location}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Calendar size={14} /> {it.duration_days} Days</span>
                </div>

                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem", lineHeight: "1.5" }}>
                  {it.description}
                </p>
              </div>

              {/* Action Buttons Row */}
              <div style={{ borderTop: "1px solid var(--surface-border)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Posted on {new Date(it.created_at).toLocaleDateString()}
                </span>
                
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link href={`/itinerary/${it.id}`} className="btn btn-secondary" style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem" }}>
                    <Eye size={14} /> View
                  </Link>
                  <Link href={`/itinerary/${it.id}/edit`} className="btn btn-secondary" style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem", borderColor: "rgba(255,255,255,0.15)" }}>
                    <Edit size={14} /> Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(it.id)}
                    disabled={deletingId === it.id}
                    className="btn btn-danger" 
                    style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem" }}
                  >
                    <Trash2 size={14} /> {deletingId === it.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
