import Link from "next/link";
import { Compass, PlusCircle, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", minHeight: "75vh", padding: "3rem 0 1rem 0" }}>
      {/* Content wrapper */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, textAlign: "center" }}>
        {/* Hero Section */}
        <section className="hero" style={{ padding: "0 1rem", marginBottom: "1.5rem" }}>
          <h1 className="hero-title" style={{ fontSize: "4.25rem", marginBottom: "1.25rem", textAlign: "center" }}>
            Real Travel Itineraries.<br />
            Verified by the <span>Community</span>.
          </h1>
          <p className="hero-subtitle" style={{ fontSize: "1.15rem", maxWidth: "550px", margin: "0 auto" }}>
            Explore authentic travel routes or post your own. Instantly export packing lists and schedules to your calendar via Zapin.
          </p>
        </section>

        {/* Main Call to Actions */}
        <div style={{ display: "flex", gap: "1.25rem", marginTop: "2.5rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/explore" className="btn btn-primary" style={{ padding: "0.95rem 1.85rem", fontSize: "0.9rem" }}>
            <Compass size={18} /> Explore Guides
          </Link>
          <Link href="/create" className="btn btn-secondary" style={{ padding: "0.95rem 1.85rem", fontSize: "0.9rem" }}>
            <PlusCircle size={18} /> Post Yours
          </Link>
        </div>
      </div>

      {/* Moving Marquee Ribbon at the bottom */}
      <div className="marquee-ribbon" style={{ margin: "4rem 0 2rem 0" }}>
        <div className="animate-marquee">
          <span>
            {Array(10).fill("COMMUNITY VERIFIED • NO MORE PHOTO SPAM • AUTOMATE YOUR CALENDAR VIA ZAPIN • EXPORT OFFLINE TRAVEL PDF • ").join("")}
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--surface-border)", paddingTop: "1.5rem", width: "100%", maxWidth: "600px", textAlign: "center" }}>
        <h4 style={{ fontSize: "0.9rem", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          <Sparkles size={14} style={{ color: "var(--primary)" }} /> Powered by <a href="https://zapin.fun" target="_blank" rel="noopener noreferrer" style={{ color: "white", textDecoration: "underline" }}>Zapin</a>
        </h4>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
          Automate trip calendar invites, packing checklists, and offline travel documents.
        </p>
      </footer>
    </div>
  );
}
