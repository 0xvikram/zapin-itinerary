import { ClerkProvider, UserButton, SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import "./globals.css";

export const metadata = {
  title: "Itinero - Share & Verify Travel Itineraries",
  description: "Find verified travel itineraries, verify routes as 'real' or 'accurate', and seamlessly organize your trips. Export itineraries directly to Zapin.",
};

export default async function RootLayout({ children }) {
  let userId = null;
  try {
    const authData = await auth();
    userId = authData?.userId;
  } catch (e) {
    console.warn("Clerk auth failed to fetch userId:", e.message);
  }

  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <div className="app-container">
            <header className="navbar">
              <Link href="/" className="nav-logo">
                Itin<span>ero</span>
              </Link>
              <nav className="nav-links">
                <Link href="/explore" className="btn btn-secondary">
                  Explore
                </Link>
                
                {userId ? (
                  <>
                    <Link href="/create" className="btn btn-primary">
                      Post Itinerary
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                  </>
                ) : (
                  <SignInButton mode="modal">
                    <button className="btn btn-primary">Sign In</button>
                  </SignInButton>
                )}
              </nav>
            </header>

            {/* Moving Marquee Ribbon at top */}
            <div className="marquee-ribbon">
              <div className="animate-marquee">
                <span>
                  {Array(10).fill("COMMUNITY VERIFIED • NO MORE PHOTO SPAM • AUTOMATE YOUR CALENDAR VIA ZAPIN • EXPORT OFFLINE TRAVEL PDF • ").join("")}
                </span>
              </div>
            </div>
            
            <main className="main-content">
              {children}
            </main>

            {/* Sticky Footer at Bottom */}
            <footer style={{ borderTop: "1px solid var(--surface-border)", padding: "1.75rem 0", marginTop: "auto", width: "100%", textAlign: "center" }}>
              <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
                <h4 style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontWeight: "700" }}>
                  <Sparkles size={14} style={{ color: "var(--primary)" }} /> Powered by <a href="https://zapin.fun" target="_blank" rel="noopener noreferrer" style={{ color: "white", textDecoration: "underline" }}>Zapin</a>
                </h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
                  Automate trip calendar invites, packing checklists, and offline travel documents.
                </p>
              </div>
            </footer>
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
