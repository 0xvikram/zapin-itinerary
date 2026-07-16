import Link from "next/link";
import { Compass, PlusCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-hero-wrap">
        {/* Hero Section */}
        <section className="hero">
          <h1 className="hero-title">
            Real Travel Itineraries.<br />
            Verified by the <span>Community</span>.
          </h1>
          <p className="hero-subtitle">
            Explore authentic community itineraries. Capture memories and share group photos instantly via <span style={{ color: "var(--primary)", fontWeight: "700" }}>zapin.fun</span>.
          </p>
        </section>

        {/* Main Call to Actions */}
        <div className="hero-actions">
          <Link href="/explore" className="btn btn-primary btn-hero">
            <Compass size={18} /> Explore Guides
          </Link>
          <Link href="/create" className="btn btn-secondary btn-hero">
            <PlusCircle size={18} /> Post Yours
          </Link>
        </div>
      </div>
    </div>
  );
}
