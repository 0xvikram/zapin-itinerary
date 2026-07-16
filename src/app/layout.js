import { ClerkProvider, UserButton, SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata = {
  title: "Roam - Community Verified Travel Itineraries",
  description: "Ditch the photospam. Roam is your ultimate travel itinerary hub. Easily verify real community routes, explore itineraries, and share group travel photos with family and friends via zapin.fun with zero manual sorting.",
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
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#daf871",
              colorBackground: "#0d0d0d",
              colorText: "#ffffff",
              colorTextSecondary: "#a3a3a3",
              colorInputBackground: "#000000",
              colorInputText: "#ffffff",
              colorBorder: "#262626",
              borderRadius: "6px",
            },
            elements: {
              card: {
                backgroundColor: "#0d0d0d",
                border: "1px solid #262626",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.4)",
              },
              headerTitle: {
                fontWeight: "800",
                letterSpacing: "-0.02em",
              },
              socialButtonsIconButton: {
                backgroundColor: "#000000",
                border: "1px solid #262626",
                "&:hover": {
                  backgroundColor: "#171717",
                }
              },
              formButtonPrimary: {
                backgroundColor: "#daf871",
                color: "#000000",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                "&:hover": {
                  backgroundColor: "#cbe960",
                }
              },
              footerActionLink: {
                color: "#daf871",
                "&:hover": {
                  color: "#cbe960",
                }
              }
            }
          }}
        >
          <div className="app-container">
            <header className="navbar">
              <Link href="/" className="nav-logo">Roam</Link>
              
              <input type="checkbox" id="nav-toggle" className="nav-toggle" style={{ display: "none" }} />
              
              <div className="navbar-right">
                {userId && <UserButton afterSignOutUrl="/" />}
                <label htmlFor="nav-toggle" className="nav-toggle-label">
                  <span></span>
                  <span></span>
                  <span></span>
                </label>
              </div>
              
              <nav className="nav-links">
                <Link href="/explore" className="btn btn-secondary">
                  Explore
                </Link>
                <Link href="/feedback" className="btn btn-secondary">
                  Feedback
                </Link>
                {userId ? (
                  <>
                    <Link href="/profile" className="btn btn-secondary">
                      Profile
                    </Link>
                    <Link href="/create" className="btn btn-primary btn-nav-create">
                      Create
                    </Link>
                  </>
                ) : (
                  <SignInButton mode="modal">
                    <button className="btn btn-primary btn-nav-create">Sign In</button>
                  </SignInButton>
                )}
              </nav>
            </header>

            <main className="main-content">
              {children}
            </main>

            {/* Moving Marquee Ribbon at bottom (above footer) */}
            <div className="marquee-ribbon" style={{ marginTop: "auto" }}>
              <div className="animate-marquee">
                <span>
                  {Array(8).fill("COMMUNITY VERIFIED • SHARE GROUP PHOTOS VIA ZAPIN.FUN • ZERO MANUAL SORTING • ").join("")}
                </span>
              </div>
            </div>

            {/* Sticky Footer at Bottom */}
            <footer style={{ borderTop: "1px solid var(--surface-border)", padding: "1.75rem 0", width: "100%", textAlign: "center" }}>
              <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                <h4 style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontWeight: "700", margin: 0 }}>
                  <Sparkles size={14} style={{ color: "var(--primary)" }} /> Powered by <a href="https://zapin.fun" target="_blank" rel="noopener noreferrer" style={{ color: "white", textDecoration: "underline" }}>zapin.fun</a>
                </h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
                  Share group travel photos with friends and family during your trips with ease, with zero manual sorting.
                </p>
                <div style={{ marginTop: "0.25rem" }}>
                  <Link href="/feedback" className="btn btn-secondary" style={{ padding: "0.45rem 1rem", fontSize: "0.75rem", display: "inline-flex", gap: "0.35rem", alignItems: "center" }}>
                    Leave Feedback
                  </Link>
                </div>
              </div>
            </footer>
            <Analytics />
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
