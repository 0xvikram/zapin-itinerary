"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateItinerary } from "../../../actions";
import { Plus, Trash2, Calendar, MapPin, DollarSign, Sparkles, UploadCloud, Lightbulb, Check } from "lucide-react";

export default function EditItineraryClient({ itinerary }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
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

  // AI states
  const [rawText, setRawText] = useState("");
  const [aiDrafting, setAiDrafting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  // Heuristic parser for raw text
  const parseRawItineraryText = (text) => {
    if (!text || text.trim() === "") return null;

    const lines = text.split("\n").map(l => l.trim()).filter(l => l !== "");
    let parsedTitle = "My Travel Route";
    let parsedLocation = "";
    let parsedBudget = "Mid-range";
    let parsedDescription = "Drafted by Roam AI from raw notes.";
    let parsedDays = [];

    // Heuristic: Detect Title
    if (lines.length > 0) {
      parsedTitle = lines[0].replace(/^title:\s*/i, "").replace(/#+\s*/, "");
    }

    // Try to find location
    for (let line of lines) {
      const locMatch = line.match(/(dest|destination|location|place|to):\s*(.*)/i);
      if (locMatch) {
        parsedLocation = locMatch[2];
        break;
      }
    }
    if (!parsedLocation && parsedTitle) {
      const words = parsedTitle.split(/\s+/);
      const cities = ["paris", "tokyo", "kyoto", "bali", "goa", "delhi", "agra", "jaipur", "iceland", "mumbai", "london", "rome", "new york"];
      for (let word of words) {
        const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase();
        if (cities.includes(cleanWord)) {
          parsedLocation = word.charAt(0).toUpperCase() + word.slice(1);
          break;
        }
      }
    }
    if (!parsedLocation) parsedLocation = "Global Destination";

    let currentDay = null;
    let timeRegex = /(\d{1,2}[:.]\d{2})\s*(AM|PM|am|pm)?/i;

    for (let line of lines) {
      const dayMatch = line.match(/(?:day|date)\s*(\d+)/i);
      if (dayMatch) {
        const dayNum = parseInt(dayMatch[1]);
        currentDay = {
          day: dayNum,
          title: line,
          activities: []
        };
        parsedDays.push(currentDay);
        continue;
      }

      if (!currentDay && (line.toLowerCase().includes("time") || line.match(timeRegex))) {
        currentDay = {
          day: 1,
          title: "Day 1 Schedule",
          activities: []
        };
        parsedDays.push(currentDay);
      }

      if (currentDay) {
        const timeMatch = line.match(timeRegex);
        if (timeMatch) {
          const timeStr = timeMatch[1] + (timeMatch[2] ? ` ${timeMatch[2].toUpperCase()}` : "");
          let activityText = line.replace(timeRegex, "").replace(/^[-–—:\s]+/, "").trim();
          let notesText = "";
          
          const noteSplit = activityText.split(/[-–—(]/);
          if (noteSplit.length > 1) {
            activityText = noteSplit[0].trim();
            notesText = noteSplit[1].replace(/\)$/, "").trim();
          }

          currentDay.activities.push({
            time: convertTo24Hour(timeStr),
            activity: activityText || "Sightseeing Walk",
            notes: notesText || "",
            mapLink: "",
            siteUrl: ""
          });
        } else if (line !== currentDay.title && currentDay.activities.length > 0 && line.length > 5) {
          const lastAct = currentDay.activities[currentDay.activities.length - 1];
          if (lastAct && !lastAct.notes) {
            lastAct.notes = line;
          }
        }
      }
    }

    if (parsedDays.length === 0) {
      parsedDays.push({
        day: 1,
        title: "Day 1 Schedule",
        activities: [
          { time: "09:00", activity: "Sightseeing Walk", notes: "Explore the streets.", mapLink: "", siteUrl: "" }
        ]
      });
    }

    function convertTo24Hour(timeStr) {
      const match = timeStr.match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)?/i);
      if (!match) return "09:00";
      let hours = parseInt(match[1]);
      const minutes = match[2];
      const ampm = match[3];
      if (ampm) {
        if (ampm.toUpperCase() === "PM" && hours < 12) hours += 12;
        if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
      }
      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    }

    return {
      title: parsedTitle,
      location: parsedLocation,
      budget: parsedBudget,
      description: parsedDescription,
      days: parsedDays
    };
  };

  // Run AI drafting simulation
  const handleAiDraftSubmit = () => {
    if (!rawText.trim()) {
      alert("Please paste some raw itinerary notes first!");
      return;
    }

    setAiDrafting(true);
    setTimeout(() => {
      const parsed = parseRawItineraryText(rawText);
      if (parsed) {
        setTitle(parsed.title);
        setLocation(parsed.location);
        setBudget(parsed.budget);
        setDescription(parsed.description);
        setDays(parsed.days);
        alert("🪄 Roam AI successfully drafted your itinerary! Review the fields and adjust the details.");
      }
      setAiDrafting(false);
    }, 1500);
  };

  // File drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type !== "text/plain" && !file.name.endsWith(".txt") && !file.name.endsWith(".md")) {
      alert("Please upload a raw text file (.txt or .md)!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setRawText(text);
    };
    reader.readAsText(file);
  };

  // AI Suggestions analyzer
  const analyzeItinerary = () => {
    setAnalyzing(true);
    setTimeout(() => {
      const list = [];
      
      // Suggestion 1: Check budget vs activities
      if (budget === "Luxury") {
        list.push({
          id: "budget-check",
          title: "Premium Activities Recommendation",
          text: "Since your budget is set to Luxury, consider adding booking links or ticket booking details to top-tier attractions.",
          actionLabel: "Add Booking Note",
          apply: () => {
            const newDays = [...days];
            newDays[0].activities[0].notes = "Consider booking high-contrast VIP entrance passes in advance. " + (newDays[0].activities[0].notes || "");
            setDays(newDays);
            alert("Added reservation reminder to first activity notes!");
          }
        });
      }

      // Suggestion 2: Space out activities
      const dayWithTooMany = days.find(d => d.activities.length > 2);
      if (dayWithTooMany) {
        list.push({
          id: "buffer-times",
          title: "Pacing & Transit Buffers",
          text: `Day ${dayWithTooMany.day} has multiple back-to-back activities. Add transiting details or spacing notes for smooth routes.`,
          actionLabel: "Insert 1h Buffer",
          apply: () => {
            const newDays = [...days];
            const dIdx = newDays.findIndex(d => d.day === dayWithTooMany.day);
            if (dIdx > -1) {
              newDays[dIdx].activities.forEach((act, aIdx) => {
                if (aIdx > 0 && !act.notes.includes("transit")) {
                  act.notes = "Leave 1-hour buffer for travel. " + act.notes;
                }
              });
              setDays(newDays);
              alert("Inserted pacing buffers to activities!");
            }
          }
        });
      }

      // Suggestion 3: Missing maps or sites
      const missingLinks = days.some(d => d.activities.some(a => !a.mapLink));
      if (missingLinks) {
        list.push({
          id: "missing-maps",
          title: "Increase Trust with Map Links",
          text: "Adding specific Google Maps links increases your community verification scores. Let's auto-generate a map search search link for your activities.",
          actionLabel: "Add Auto Map Searches",
          apply: () => {
            const newDays = [...days];
            newDays.forEach(d => {
              d.activities.forEach(a => {
                if (!a.mapLink) {
                  a.mapLink = `https://maps.google.com/?q=${encodeURIComponent(a.activity + " " + location)}`;
                }
              });
            });
            setDays(newDays);
            alert("Auto-generated search map links based on your activity titles!");
          }
        });
      }

      // Suggestion 4: General reinforcement
      if (list.length === 0) {
        list.push({
          id: "perfect-pacing",
          title: "Itinerary Pacing looks Good!",
          text: "Your current travel schedule has balanced day breaks and clean spacing details. Ready to save changes!",
          actionLabel: "Save Now",
          apply: () => {
            handleSubmit({ preventDefault: () => {} });
          }
        });
      }

      setSuggestions(list);
      setAnalyzing(false);
    }, 1200);
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!title || !location || !description) {
      alert("Please fill in all core fields!");
      return;
    }

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

  const handleRemoveDay = (dayIndex) => {
    if (days.length === 1) return;
    const newDays = days
      .filter((_, idx) => idx !== dayIndex)
      .map((day, idx) => ({
        ...day,
        day: idx + 1
      }));
    setDays(newDays);
  };

  const handleDayTitleChange = (dayIndex, value) => {
    const newDays = [...days];
    newDays[dayIndex].title = value;
    setDays(newDays);
  };

  const handleAddActivity = (dayIndex) => {
    const newDays = [...days];
    newDays[dayIndex].activities.push({ time: "12:00", activity: "", notes: "", mapLink: "", siteUrl: "" });
    setDays(newDays);
  };

  const handleActivityChange = (dayIndex, actIndex, field, value) => {
    const newDays = [...days];
    newDays[dayIndex].activities[actIndex][field] = value;
    setDays(newDays);
  };

  const handleRemoveActivity = (dayIndex, actIndex) => {
    const newDays = [...days];
    newDays[dayIndex].activities = newDays[dayIndex].activities.filter((_, idx) => idx !== actIndex);
    setDays(newDays);
  };

  return (
    <div className="creator-container" style={{ maxWidth: "1200px" }}>
      <div className="creator-header">
        <h1 className="creator-title">
          Edit Your Travel Itinerary
        </h1>
        <p className="creator-description">
          Make adjustments to your route details, maps links, and website parameters.
        </p>
      </div>

      {/* Zapin Creator Promo */}
      <div className="zapin-banner creator-banner" style={{ marginBottom: "2rem" }}>
        <div className="zapin-banner-content">
          <h4 className="banner-title">
            <Sparkles size={16} style={{ color: "var(--primary)" }} /> Powered by zapin.fun
          </h4>
          <p className="banner-text">
            Keep your itineraries updated so travelers can capture the right moments and share group photos seamlessly via zapin.fun.
          </p>
        </div>
      </div>

      {/* Two-Column split layout */}
      <div className="creator-layout-split">
        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} className="creator-form" style={{ margin: 0 }}>
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
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        {/* Right Column: AI Assistant Toolbox */}
        <div className="ai-toolbox">
          {/* AI Text Importer */}
          <div className="ai-card">
            <h3 className="ai-card-title">
              <Sparkles size={18} style={{ color: "var(--primary)" }} /> Roam AI Draft Importer
            </h3>
            <p className="ai-card-text">
              Paste raw trip notes, emails, or drop a text file below. Roam AI will parse schedules, times, and maps into structured fields instantly.
            </p>

            <div 
              className={`ai-drag-area ${dragActive ? "active" : ""}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={28} style={{ color: "var(--primary)", marginBottom: "0.5rem" }} />
              <div>Drag & drop text file here or <span style={{ color: "var(--primary)", textDecoration: "underline" }}>browse</span></div>
              <input 
                ref={fileInputRef}
                type="file" 
                style={{ display: "none" }} 
                accept=".txt,.md"
                onChange={handleFileChange}
              />
            </div>

            <textarea
              className="form-control ai-textarea"
              placeholder="Or paste raw text notes here... E.g.&#10;Kyoto Tour&#10;Day 1: Arrival&#10;09:00 AM - Arrive at hotel&#10;12:00 PM - Lunch near station"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />

            <button
              type="button"
              disabled={aiDrafting}
              onClick={handleAiDraftSubmit}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", fontSize: "0.85rem", padding: "0.65rem" }}
            >
              {aiDrafting ? "🪄 AI Drafting..." : "Draft with Roam AI"}
            </button>
          </div>

          {/* AI Suggestions Panel */}
          <div className="ai-card" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.01), rgba(0, 0, 0, 0.3))" }}>
            <h3 className="ai-card-title">
              <Lightbulb size={18} style={{ color: "var(--primary)" }} /> Roam AI Assistant
            </h3>
            <p className="ai-card-text">
              Analyze your current schedule and get suggestions for pacing, maps links, and verification points.
            </p>

            {suggestions.length > 0 ? (
              <div className="ai-suggestions-list">
                {suggestions.map((sug) => (
                  <div key={sug.id} className="ai-suggestion-item">
                    <div className="ai-suggestion-header">
                      <Sparkles size={12} style={{ color: "var(--primary)" }} /> {sug.title}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                      {sug.text}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        sug.apply();
                        // Filter out applied suggestion
                        setSuggestions(suggestions.filter(s => s.id !== sug.id));
                      }}
                      className="ai-suggestion-apply"
                    >
                      <Check size={12} /> {sug.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              disabled={analyzing}
              onClick={analyzeItinerary}
              className="btn btn-secondary"
              style={{ width: "100%", justifyContent: "center", fontSize: "0.85rem", padding: "0.65rem", marginTop: suggestions.length > 0 ? "0.5rem" : 0 }}
            >
              {analyzing ? "Analyzing Itinerary..." : "Analyze Current Itinerary"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
