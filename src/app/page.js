import Link from "next/link";
import { Compass, PlusCircle } from "lucide-react";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "65vh", textAlign: "center", padding: "2rem 0" }}>
      {/* Hero Section */}
      <section className="hero" style={{ padding: "0 1rem", marginBottom: "1rem" }}>
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
  );
}
