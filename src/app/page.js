import { getItineraries } from "./actions";
import Link from "next/link";
import { Search, MapPin, Calendar, DollarSign, ArrowUp, MessageSquare, BadgeCheck, ShieldCheck } from "lucide-react";

export default async function Home({ searchParams }) {
  // Await searchParams in Next.js 14+
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q || "";
  const itineraries = await getItineraries(query);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">Discover Real Travel Itineraries Verified by the Community</h1>
        <p className="hero-subtitle">
          Explore day-by-day itineraries, upvote the best guides, verify authentic experiences, and export them directly to your calendar or documents via Zapin.
        </p>
      </section>

      {/* Zapin Sticky Banner */}
      <div className="zapin-banner">
        <div className="zapin-banner-content">
          <h4>⚡ Supercharge Your Trip with Zapin</h4>
          <p>
            Convert any of these itineraries into automated calendar events, packing checklists, and offline PDFs instantly.
          </p>
        </div>
        <a 
          href="https://zapin.web" // placeholder link to main product
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-zapin"
        >
          Try Zapin Free
        </a>
      </div>

      {/* Search Input Container */}
      <form action="/" method="GET" className="search-container">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search by destination (e.g. Tokyo, Italy, New York)..."
          className="search-input"
        />
      </form>

      {/* Results Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "var(--font-title)" }}>
          {query ? `Search results for "${query}"` : "Trending Itineraries"}
        </h2>
        <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Showing {itineraries.length} guides
        </span>
      </div>

      {/* Itineraries Grid */}
      {itineraries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--surface-border)" }}>
          <MapPin size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
          <h3>No itineraries found</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Try searching for a different city or create a new public itinerary.
          </p>
        </div>
      ) : (
        <div className="itinerary-grid">
          {itineraries.map((it) => {
            // Calculate scores
            const upvotes = it.votes?.filter((v) => v.vote_type === "upvote").length || 0;
            const downvotes = it.votes?.filter((v) => v.vote_type === "downvote").length || 0;
            const score = upvotes - downvotes;

            const realCount = it.verifications?.filter((v) => v.is_real).length || 0;
            const accurateCount = it.verifications?.filter((v) => v.is_accurate).length || 0;

            return (
              <div key={it.id} className="itinerary-card">
                <div className="card-header">
                  <div className="card-badge-row">
                    <span className="badge badge-budget">{it.budget}</span>
                    {realCount > 0 && (
                      <span className="badge badge-real">
                        ✓ {realCount} Found Real
                      </span>
                    )}
                    {accurateCount > 0 && (
                      <span className="badge badge-accurate">
                        ★ {accurateCount} Accurate
                      </span>
                    )}
                  </div>
                  <h3 className="card-title">
                    <Link href={`/itinerary/${it.id}`}>{it.title}</Link>
                  </h3>
                  <div className="card-meta">
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <MapPin size={14} /> {it.location}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Calendar size={14} /> {it.duration_days} Days
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <p className="card-description">{it.description}</p>
                </div>

                <div className="card-footer">
                  <div className="author-info">
                    {it.author_image ? (
                      <img src={it.author_image} alt={it.author_name} className="author-img" />
                    ) : (
                      <div className="author-img" style={{ background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "0.75rem" }}>
                        {it.author_name.charAt(0)}
                      </div>
                    )}
                    <span>By {it.author_name}</span>
                  </div>

                  <div style={{ display: "flex", gap: "1rem", color: "var(--text-muted)", fontSize: "0.85rem", alignItems: "center" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <ArrowUp size={16} /> {score}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <MessageSquare size={16} /> {it.comments?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
