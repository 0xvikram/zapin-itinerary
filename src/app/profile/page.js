import { getUserItineraries } from "../actions";
import ProfileClient from "./ProfileClient";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "My Profile - Roam",
  description: "View and manage your travel itineraries on Roam.",
};

export default async function ProfilePage() {
  const authData = await auth();
  const userId = authData?.userId;

  // Protect route server-side too
  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch only this user's itineraries
  const userItineraries = await getUserItineraries();

  return <ProfileClient initialItineraries={userItineraries} />;
}
