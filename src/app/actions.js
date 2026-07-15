"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// MOCK DATA FOR GRACEFUL PREVIEW / FALLBACK
const MOCK_ITINERARIES = [
  {
    id: "mock-1",
    user_id: "user_1",
    author_name: "Sarah Jenkins",
    author_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    title: "5 Days in Tokyo: Neon Lights & Ancient Temples",
    location: "Tokyo, Japan",
    duration_days: 5,
    budget: "Mid-range",
    description: "An optimized route covering the best of Shinjuku, Shibuya, historical Asakusa, and a day trip to Mount Fuji. Optimized with Zapin calendar schedules.",
    content: {
      days: [
        {
          day: 1,
          title: "Modern Tokyo & Shibuya",
          activities: [
            { time: "09:00 AM", activity: "Shibuya Crossing & Hachiko Statue", notes: "Best view from the 2nd floor of Starbucks or the magnetic deck." },
            { time: "12:00 PM", activity: "Lunch at Ichiran Ramen Shibuya", notes: "Be ready for a short queue, but it's worth it!" },
            { time: "03:00 PM", activity: "Meiji Shrine & Harajuku", notes: "Walk through the serene forest path to escape the city noise." }
          ]
        },
        {
          day: 2,
          title: "Historic Tokyo & Asakusa",
          activities: [
            { time: "10:00 AM", activity: "Senso-ji Temple", notes: "Tokyo's oldest and most famous temple. Grab some traditional snacks along Nakamise street." },
            { time: "01:00 PM", activity: "Cruising Sumida River", notes: "Take a scenic boat cruise down to Odaiba seaside park." }
          ]
        }
      ]
    },
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    votes: [
      { user_id: "user_2", vote_type: "upvote" },
      { user_id: "user_3", vote_type: "upvote" }
    ],
    verifications: [
      { user_id: "user_2", is_real: true, is_accurate: true },
      { user_id: "user_4", is_real: true, is_accurate: false }
    ],
    comments: [
      {
        id: "c1",
        author_name: "Alex Rivera",
        author_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        content: "Did this exact route last week! The Sumida River Cruise has incredible views at sunset.",
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: "mock-2",
    user_id: "user_5",
    author_name: "Marcus Vance",
    author_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    title: "Amalfi Coast Weekend Getaway",
    location: "Positano, Italy",
    duration_days: 3,
    budget: "Luxury",
    description: "Relaxed itinerary covering beach spots, boat rental, and cliffside dining spots. Includes direct Zapin checklist for packing.",
    content: {
      days: [
        {
          day: 1,
          title: "Positano Arrival & Beach Day",
          activities: [
            { time: "11:00 AM", activity: "Check-in at Le Sirenuse", notes: "Gorgeous views of the colorful buildings cascading down." },
            { time: "01:00 PM", activity: "Spiaggia Grande beach lunch", notes: "Enjoy fresh seafood pasta steps away from the water." }
          ]
        }
      ]
    },
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    votes: [
      { user_id: "user_1", vote_type: "upvote" }
    ],
    verifications: [
      { user_id: "user_1", is_real: true, is_accurate: true }
    ],
    comments: []
  }
];

function isSupabaseConfigured() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_supabase_project_url" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your_supabase_anon_key"
  );
}

function isClerkConfigured() {
  return (
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "your_clerk_publishable_key"
  );
}

// Auth state helper to avoid Clerk validation errors when Clerk is not configured
async function getUserIdHelper() {
  if (isClerkConfigured()) {
    try {
      const authObj = await auth();
      return authObj?.userId || "demo-user";
    } catch (e) {
      console.warn("Clerk auth retrieve failed:", e.message);
    }
  }
  return "demo-user";
}

async function getUserDetailsHelper() {
  if (isClerkConfigured()) {
    try {
      const authObj = await auth();
      const user = await currentUser();
      if (authObj?.userId && user) {
        return {
          userId: authObj.userId,
          name: user.fullName || user.username || "Traveler",
          image: user.imageUrl || ""
        };
      }
    } catch (e) {
      console.warn("Clerk user details retrieve failed:", e.message);
    }
  }
  return {
    userId: "demo-user",
    name: "Demo Traveler",
    image: ""
  };
}

// 1. GET ITINERARIES (with search)
export async function getItineraries(query = "") {
  try {
    if (!isSupabaseConfigured()) {
      if (!query) return MOCK_ITINERARIES;
      return MOCK_ITINERARIES.filter(
        (it) =>
          it.location.toLowerCase().includes(query.toLowerCase()) ||
          it.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    let selectQuery = supabase
      .from("itineraries")
      .select(`
        *,
        itinerary_votes(user_id, vote_type),
        itinerary_verifications(user_id, is_real, is_accurate),
        comments(id)
      `);

    if (query) {
      selectQuery = selectQuery.ilike("location", `%${query}%`);
    }

    const { data, error } = await selectQuery.order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((it) => ({
      ...it,
      votes: it.itinerary_votes || [],
      verifications: it.itinerary_verifications || [],
      comments: it.comments || []
    }));
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    return MOCK_ITINERARIES;
  }
}

// 2. GET ITINERARY BY ID
export async function getItineraryById(id) {
  try {
    if (!isSupabaseConfigured() || id.startsWith("mock-")) {
      return MOCK_ITINERARIES.find((it) => it.id === id) || null;
    }

    const { data, error } = await supabase
      .from("itineraries")
      .select(`
        *,
        itinerary_votes(user_id, vote_type),
        itinerary_verifications(user_id, is_real, is_accurate),
        comments(*)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    return {
      ...data,
      votes: data.itinerary_votes || [],
      verifications: data.itinerary_verifications || [],
      comments: (data.comments || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      ),
    };
  } catch (error) {
    console.error("Error fetching itinerary:", error);
    return MOCK_ITINERARIES.find((it) => it.id === id) || null;
  }
}

// 3. CREATE ITINERARY
export async function createItinerary(formData) {
  const { userId, name, image } = await getUserDetailsHelper();

  const { title, location, duration_days, budget, description, content } = formData;

  try {
    if (!isSupabaseConfigured()) {
      const newItinerary = {
        id: `mock-${Date.now()}`,
        user_id: userId,
        author_name: name,
        author_image: image,
        title,
        location,
        duration_days: parseInt(duration_days),
        budget,
        description,
        content: typeof content === "string" ? JSON.parse(content) : content,
        created_at: new Date().toISOString(),
        votes: [],
        verifications: [],
        comments: [],
      };
      MOCK_ITINERARIES.unshift(newItinerary);
      return { success: true, id: newItinerary.id };
    }

    const { data, error } = await supabase
      .from("itineraries")
      .insert({
        user_id: userId,
        author_name: name,
        author_image: image,
        title,
        location,
        duration_days: parseInt(duration_days),
        budget,
        description,
        content: typeof content === "string" ? JSON.parse(content) : content,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/");
    return { success: true, id: data.id };
  } catch (error) {
    console.error("Error creating itinerary:", error);
    return { success: false, error: error.message };
  }
}

// 4. TOGGLE VOTE (UPVOTE / DOWNVOTE)
export async function toggleVote(itineraryId, voteType) {
  const userId = await getUserIdHelper();

  try {
    if (!isSupabaseConfigured() || itineraryId.startsWith("mock-")) {
      const item = MOCK_ITINERARIES.find((it) => it.id === itineraryId);
      if (item) {
        const existingIdx = item.votes.findIndex((v) => v.user_id === userId);
        if (existingIdx > -1) {
          if (item.votes[existingIdx].vote_type === voteType) {
            item.votes.splice(existingIdx, 1);
          } else {
            item.votes[existingIdx].vote_type = voteType;
          }
        } else {
          item.votes.push({ user_id: userId, vote_type: voteType });
        }
      }
      return { success: true };
    }

    const { data: existing } = await supabase
      .from("itinerary_votes")
      .select()
      .eq("itinerary_id", itineraryId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      if (existing.vote_type === voteType) {
        await supabase
          .from("itinerary_votes")
          .delete()
          .eq("itinerary_id", itineraryId)
          .eq("user_id", userId);
      } else {
        await supabase
          .from("itinerary_votes")
          .update({ vote_type: voteType })
          .eq("itinerary_id", itineraryId)
          .eq("user_id", userId);
      }
    } else {
      await supabase
        .from("itinerary_votes")
        .insert({ itinerary_id: itineraryId, user_id: userId, vote_type: voteType });
    }

    revalidatePath(`/itinerary/${itineraryId}`);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error toggling vote:", error);
    return { success: false, error: error.message };
  }
}

// 5. TOGGLE VERIFICATION (IS REAL / IS ACCURATE)
export async function toggleVerification(itineraryId, metricType) {
  const userId = await getUserIdHelper();

  try {
    if (!isSupabaseConfigured() || itineraryId.startsWith("mock-")) {
      const item = MOCK_ITINERARIES.find((it) => it.id === itineraryId);
      if (item) {
        let ver = item.verifications.find((v) => v.user_id === userId);
        if (!ver) {
          ver = { user_id: userId, is_real: false, is_accurate: false };
          item.verifications.push(ver);
        }
        if (metricType === "real") {
          ver.is_real = !ver.is_real;
        } else if (metricType === "accurate") {
          ver.is_accurate = !ver.is_accurate;
        }
      }
      return { success: true };
    }

    const { data: existing } = await supabase
      .from("itinerary_verifications")
      .select()
      .eq("itinerary_id", itineraryId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      const update = {};
      if (metricType === "real") update.is_real = !existing.is_real;
      if (metricType === "accurate") update.is_accurate = !existing.is_accurate;

      await supabase
        .from("itinerary_verifications")
        .update(update)
        .eq("itinerary_id", itineraryId)
        .eq("user_id", userId);
    } else {
      const insert = { itinerary_id: itineraryId, user_id: userId, is_real: false, is_accurate: false };
      if (metricType === "real") insert.is_real = true;
      if (metricType === "accurate") insert.is_accurate = true;

      await supabase.from("itinerary_verifications").insert(insert);
    }

    revalidatePath(`/itinerary/${itineraryId}`);
    return { success: true };
  } catch (error) {
    console.error("Error toggling verification:", error);
    return { success: false, error: error.message };
  }
}

// 6. ADD COMMENT
export async function addComment(itineraryId, commentContent) {
  const { userId, name, image } = await getUserDetailsHelper();

  try {
    if (!isSupabaseConfigured() || itineraryId.startsWith("mock-")) {
      const item = MOCK_ITINERARIES.find((it) => it.id === itineraryId);
      if (item) {
        item.comments.unshift({
          id: `comment-${Date.now()}`,
          author_name: name,
          author_image: image,
          content: commentContent,
          created_at: new Date().toISOString()
        });
      }
      return { success: true };
    }

    const { error } = await supabase
      .from("comments")
      .insert({
        itinerary_id: itineraryId,
        user_id: userId,
        author_name: name,
        author_image: image,
        content: commentContent
      });

    if (error) throw error;

    revalidatePath(`/itinerary/${itineraryId}`);
    return { success: true };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { success: false, error: error.message };
  }
}
