import { ClerkProvider, UserButton, SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Zapin Itinerary Hub - Share & Verify Travel Itineraries",
  description: "Find verified travel itineraries, verify routes as 'real' or 'accurate', and seamlessly organize your trips. Export itineraries directly to Zapin.",
};

export default async function RootLayout({ children }) {
  const isClerkConfigured = 
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "your_clerk_publishable_key";

  let userId = null;
  if (isClerkConfigured) {
    try {
      const authData = await auth();
      userId = authData?.userId;
    } catch (e) {
      console.warn("Clerk auth failed to fetch userId:", e.message);
    }
  }

  const navContent = (
    <nav className="nav-links">
      <Link href="/" className="btn btn-secondary">
        Explore
      </Link>
      
      {isClerkConfigured ? (
        userId ? (
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
        )
      ) : (
        <Link href="/create" className="btn btn-primary">
          Post Itinerary (Demo)
        </Link>
      )}
    </nav>
  );

  const bodyContent = (
    <div className="app-container">
      <header className="navbar">
        <Link href="/" className="nav-logo">
          ✈️ Zapin Itinerary Hub
        </Link>
        {navContent}
      </header>
      
      <main className="main-content">
        {!isClerkConfigured && (
          <div style={{ 
            background: "rgba(99, 102, 241, 0.1)", 
            border: "1px solid var(--primary)", 
            color: "var(--text)", 
            padding: "0.75rem 1.5rem", 
            borderRadius: "var(--radius-sm)", 
            marginBottom: "1.5rem", 
            fontSize: "0.85rem", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem"
          }}>
            <span>⚠️ <strong>Demo Mode:</strong> Clerk authentication and Supabase database are not configured. Working with local mockup data.</span>
            <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>Configure `.env.local` variables to enable database & login.</span>
          </div>
        )}
        {children}
      </main>
    </div>
  );

  if (isClerkConfigured) {
    return (
      <html lang="en">
        <body>
          <ClerkProvider>
            {bodyContent}
          </ClerkProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        {bodyContent}
      </body>
    </html>
  );
}
