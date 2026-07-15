import { getItineraries } from "../actions";
import Link from "next/link";
import { Search, MapPin, Calendar, ArrowUp, MessageSquare } from "lucide-react";

export default async function ExplorePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q || "";
  const itineraries = await getItineraries(query);

  return (
    <div>
      {/* Small Header */}
      <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontFamily: "var(--font-title)", marginBottom: "0.5rem" }}>
          Explore Travel <span>Itineraries</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Search for cities, countries, or regions to find community-verified routes.
        </p>
      </div>

      {/* Search Input Container */}
      <form action="/explore" method="GET" className="search-container">
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
        <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>
          {query ? `Search results for "${query}"` : "Trending Guides"}
        </h2>
        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
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
                        ✓ {realCount} Real
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
                      <div className="author-img" style={{ background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "0.7rem" }}>
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
