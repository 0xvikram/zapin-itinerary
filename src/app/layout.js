import { ClerkProvider, UserButton, SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
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
            
            <main className="main-content">
              {children}
            </main>
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
