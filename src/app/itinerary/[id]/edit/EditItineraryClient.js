"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateItinerary } from "../../../actions";
import { Plus, Trash2, Calendar, MapPin, DollarSign, Sparkles } from "lucide-react";

export default function EditItineraryClient({ itinerary }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(itinerary.title);
  const [location, setLocation] = useState(itinerary.location);
  const [budget, setBudget] = useState(itinerary.budget);
  const [description, setDescription] = useState(itinerary.description);
  
  // Prepopulate days from itinerary content
  const [days, setDays] = useState(itinerary.content?.days || [
    {
      day: 1,
      title: "First Day Exploration",
      activities: [{ time: "09:00", activity: "Arrive and Check-in", notes: "", mapLink: "", siteUrl: "" }]
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
        activities: [{ time: "09:00", activity: "", notes: "", mapLink: "", siteUrl: "" }]
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
    newDays[dayIndex].activities.push({ time: "12:00", activity: "", notes: "", mapLink: "", siteUrl: "" });
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

    const response = await updateItinerary(itinerary.id, formData);
    setLoading(false);

    if (response.success) {
      alert("Itinerary updated successfully!");
      router.push(`/itinerary/${itinerary.id}`);
    } else {
      alert(response.error || "Failed to update itinerary. Check server logs.");
    }
  };

  return (
    <div className="creator-container">
      <div className="creator-header">
        <h1 className="creator-title">
          Edit Your Travel Itinerary
        </h1>
        <p className="creator-description">
          Make adjustments to your route details, maps links, and website parameters.
        </p>
      </div>

      {/* Zapin Creator Promo */}
      <div className="zapin-banner creator-banner">
        <div className="zapin-banner-content">
          <h4 className="banner-title">
            <Sparkles size={16} style={{ color: "var(--primary)" }} /> Powered by zapin.fun
          </h4>
          <p className="banner-text">
            Keep your itineraries updated so travelers can capture the right moments and share group photos seamlessly via zapin.fun.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="creator-form">
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

        <div className="form-grid-2">
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
            placeholder="Introduce your trip..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Dynamic Days Builder */}
        <h2 className="builder-section-title">
          Trip Timeline & Schedule
        </h2>

        {days.map((day, dayIdx) => (
          <div key={dayIdx} className="day-builder-card">
            <div className="day-builder-header">
              <h3 className="day-title">Day {day.day}</h3>
              {days.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveDay(dayIdx)}
                  className="btn-remove-day"
                >
                  <Trash2 size={14} /> Remove Day
                </button>
              )}
            </div>

            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Day Theme/Title..."
                value={day.title}
                onChange={(e) => handleDayTitleChange(dayIdx, e.target.value)}
                required
              />
            </div>

            {/* Activities list in day */}
            <div className="activities-builder-list">
              <div className="activities-label">Activities:</div>
              {day.activities.map((act, actIdx) => (
                <div key={actIdx} className="activity-input-card">
                  {/* Row 1: Time, Title, Notes & Delete */}
                  <div className="activity-row">
                    <input
                      type="time"
                      className="form-control activity-time-input"
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
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Website / Ticket URL (optional)"
                      value={act.siteUrl || ""}
                      onChange={(e) => handleActivityChange(dayIdx, actIdx, "siteUrl", e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => handleAddActivity(dayIdx)}
                className="btn btn-secondary btn-add-activity"
              >
                <Plus size={14} /> Add Activity
              </button>
            </div>
          </div>
        ))}

        <div className="form-actions">
          <button
            type="button"
            onClick={handleAddDay}
            className="btn btn-secondary btn-form-action"
          >
            <Plus size={16} /> Add Day to Itinerary
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-form-action"
          >
            {loading ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
