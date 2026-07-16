"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createItinerary } from "../actions";
import { Plus, Trash2, Calendar, MapPin, DollarSign, Sparkles } from "lucide-react";

export default function CreateItineraryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("Mid-range");
  const [description, setDescription] = useState("");
  
  // Schedule state: array of days, each with title and activities list
  const [days, setDays] = useState([
    {
      day: 1,
      title: "First Day Exploration",
      activities: [{ time: "09:00 AM", activity: "Arrive and Check-in", notes: "", mapLink: "", siteUrl: "" }]
    }
  ]);

  // 1. Add a new day
  const handleAddDay = () => {
    const nextDayNum = days.length + 1;
    setDays([
      ...days,
      {
        day: nextDayNum,
        title: `Day ${nextDayNum} Schedule`,
        activities: [{ time: "09:00 AM", activity: "", notes: "", mapLink: "", siteUrl: "" }]
      }
    ]);
  };

  // 2. Remove a day
  const handleRemoveDay = (dayIndex) => {
    if (days.length === 1) return;
    const newDays = days
      .filter((_, idx) => idx !== dayIndex)
      .map((day, idx) => ({
        ...day,
        day: idx + 1 // recalculate day numbering
      }));
    setDays(newDays);
  };

  // 3. Update day title
  const handleDayTitleChange = (dayIndex, value) => {
    const newDays = [...days];
    newDays[dayIndex].title = value;
    setDays(newDays);
  };

  // 4. Add activity to a day
  const handleAddActivity = (dayIndex) => {
    const newDays = [...days];
    newDays[dayIndex].activities.push({ time: "12:00 PM", activity: "", notes: "", mapLink: "", siteUrl: "" });
    setDays(newDays);
  };

  // 5. Update activity value
  const handleActivityChange = (dayIndex, actIndex, field, value) => {
    const newDays = [...days];
    newDays[dayIndex].activities[actIndex][field] = value;
    setDays(newDays);
  };

  // 6. Remove activity from a day
  const handleRemoveActivity = (dayIndex, actIndex) => {
    const newDays = [...days];
    newDays[dayIndex].activities = newDays[dayIndex].activities.filter((_, idx) => idx !== actIndex);
    setDays(newDays);
  };

  // 7. Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !location || !description) {
      alert("Please fill in all core fields!");
      return;
    }

    // Validate that activities exist and are not empty
    const isValid = days.every(d => 
      d.activities.length > 0 && d.activities.every(a => a.activity.trim() !== "")
    );
    if (!isValid) {
      alert("Please make sure all activities have names entered.");
      return;
    }

    setLoading(true);

    const formData = {
      title,
      location,
      duration_days: days.length,
      budget,
      description,
      content: { days }
    };

    const response = await createItinerary(formData);
    setLoading(false);

    if (response.success) {
      router.push(`/itinerary/${response.id}`);
    } else {
      alert(response.error || "Failed to create itinerary. Check server logs.");
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem", fontFamily: "var(--font-title)" }}>
          Post Your Travel Itinerary
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Share your real trip experience. The community will verify and rank your itinerary.
        </p>
      </div>

      {/* Zapin Creator Promo */}
      <div className="zapin-banner" style={{ marginBottom: "2rem", padding: "1.25rem", background: "linear-gradient(135deg, #1e1b4b, #200831)" }}>
        <div className="zapin-banner-content">
          <h4 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={16} style={{ color: "var(--zapin)" }} /> Powered by Zapin
          </h4>
          <p style={{ fontSize: "0.85rem" }}>
            Once published, travelers can instantly turn your plan into automated Google Calendar events & custom checklist packages.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: "var(--radius-md)", padding: "2.5rem", boxShadow: "var(--shadow-md)" }}>
        {/* Core fields */}
        <div className="form-group">
          <label className="form-label">Itinerary Title</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. 3 Days Exploring the Waterfalls of Bali"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Destination Location</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Bali, Indonesia"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Budget Tier</label>
            <select
              className="form-control"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            >
              <option value="Budget">Budget ($)</option>
              <option value="Mid-range">Mid-range ($$)</option>
              <option value="Luxury">Luxury ($$$)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Short Description</label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Introduce your trip. What makes it unique? Why can people trust this is an accurate route?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Dynamic Days Builder */}
        <h2 style={{ fontFamily: "var(--font-title)", fontSize: "1.5rem", margin: "2rem 0 1rem 0", borderBottom: "1px solid var(--surface-border)", paddingBottom: "0.5rem" }}>
          Trip Timeline & Schedule
        </h2>

        {days.map((day, dayIdx) => (
          <div key={dayIdx} style={{ background: "var(--background)", border: "1px solid var(--surface-border)", borderRadius: "var(--radius-sm)", padding: "1.5rem", marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem" }}>Day {day.day}</h3>
              {days.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveDay(dayIdx)}
                  style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.85rem" }}
                >
                  <Trash2 size={14} /> Remove Day
                </button>
              )}
            </div>

            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Day Theme/Title (e.g. South Beach Walks & Seafood dinner)"
                value={day.title}
                onChange={(e) => handleDayTitleChange(dayIdx, e.target.value)}
                required
              />
            </div>

            {/* Activities list in day */}
            <div style={{ paddingLeft: "1rem", borderLeft: "2px dashed var(--surface-border)" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "0.75rem", color: "var(--text-muted)" }}>Activities:</div>
              {day.activities.map((act, actIdx) => (
                <div key={actIdx} className="activity-input-card">
                  {/* Row 1: Time, Title, Notes & Delete */}
                  <div className="activity-row">
                    <input
                      type="text"
                      className="form-control activity-time-input"
                      placeholder="Time (e.g. 10:00 AM)"
                      value={act.time}
                      onChange={(e) => handleActivityChange(dayIdx, actIdx, "time", e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-control activity-text-input"
                      placeholder="What did you do?"
                      value={act.activity}
                      onChange={(e) => handleActivityChange(dayIdx, actIdx, "activity", e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="form-control activity-notes-input"
                      placeholder="Notes (optional details)"
                      value={act.notes}
                      onChange={(e) => handleActivityChange(dayIdx, actIdx, "notes", e.target.value)}
                    />
                    {day.activities.length > 1 && (
                      <button
                        type="button"
                        className="activity-remove-btn"
                        onClick={() => handleRemoveActivity(dayIdx, actIdx)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  
                  {/* Row 2: Maps and Site URLs */}
                  <div className="activity-details-row">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Google Maps URL (optional)"
                      value={act.mapLink || ""}
                      onChange={(e) => handleActivityChange(dayIdx, actIdx, "mapLink", e.target.value)}
                      style={{ fontSize: "0.8rem", padding: "0.5rem 0.75rem" }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Website / Ticket URL (optional)"
                      value={act.siteUrl || ""}
                      onChange={(e) => handleActivityChange(dayIdx, actIdx, "siteUrl", e.target.value)}
                      style={{ fontSize: "0.8rem", padding: "0.5rem 0.75rem" }}
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => handleAddActivity(dayIdx)}
                className="btn btn-secondary"
                style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", marginTop: "0.5rem" }}
              >
                <Plus size={14} /> Add Activity
              </button>
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
          <button
            type="button"
            onClick={handleAddDay}
            className="btn btn-secondary"
            style={{ flex: 1, justifyContent: "center" }}
          >
            <Plus size={16} /> Add Day to Itinerary
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: "center" }}
          >
            {loading ? "Publishing..." : "Publish Itinerary"}
          </button>
        </div>
      </form>
    </div>
  );
}
