import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function Page() {
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "75vh", padding: "2rem" }}>
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <Link href="/" style={{ fontSize: "2rem", fontWeight: "800", letterSpacing: "-0.04em", color: "white", textDecoration: "none" }}>
          Roam<span style={{ color: "var(--primary)" }}>.</span>
        </Link>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
          Sign in to post itineraries and join the conversation.
        </p>
      </div>
      <SignIn />
    </div>
  );
}
