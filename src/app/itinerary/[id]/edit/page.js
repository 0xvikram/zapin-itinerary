import { getItineraryById } from "../../../actions";
import EditItineraryClient from "./EditItineraryClient";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Edit Itinerary - Roam",
  description: "Edit your posted travel itinerary on Roam.",
};

export default async function EditItineraryPage({ params }) {
  const resolvedParams = await params;
  const itinerary = await getItineraryById(resolvedParams.id);

  // Authenticated user check
  const authData = await auth();
  const userId = authData?.userId;

  if (!userId) {
    redirect("/sign-in");
  }

  // Ownership verification check
  if (!itinerary || itinerary.user_id !== userId) {
    redirect("/explore");
  }

  return <EditItineraryClient itinerary={itinerary} />;
}
