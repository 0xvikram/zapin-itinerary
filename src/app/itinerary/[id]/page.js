import { getItineraryById } from "../../actions";
import { auth } from "@clerk/nextjs/server";
import ItineraryDetailsClient from "./ItineraryDetailsClient";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const itinerary = await getItineraryById(resolvedParams.id);
  
  if (!itinerary) {
    return {
      title: "Itinerary Not Found",
    };
  }

  return {
    title: `${itinerary.title} - Zapin Itinerary Hub`,
    description: itinerary.description,
  };
}

export default async function ItineraryDetailPage({ params }) {
  const resolvedParams = await params;
  const itinerary = await getItineraryById(resolvedParams.id);
  
  if (!itinerary) {
    notFound();
  }

  const { userId } = await auth();

  return (
    <ItineraryDetailsClient 
      initialItinerary={itinerary} 
      currentUserId={userId} 
    />
  );
}
