"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// MOCK DATA WITH COMMUNITY & AI GENERATED ITINERARIES
const MOCK_ITINERARIES = [
  // 1. AI Generated - National (India)
  {
    id: "mock-ai-1",
    user_id: "ai-planner",
    author_name: "Itinero AI",
    author_image: "",
    title: "Golden Triangle: Cultural Wonders of India",
    location: "Delhi, Agra, & Jaipur, India",
    duration_days: 5,
    budget: "Mid-range",
    description: "Discover the heritage of Northern India. Explore historic monuments in Delhi, witness the sunrise at the Taj Mahal, and tour the pink palaces of Jaipur.",
    content: {
      days: [
        {
          day: 1,
          title: "Historic Delhi Sights",
          activities: [
            { time: "09:00 AM", activity: "Qutub Minar & Lotus Temple", notes: "Start early to beat the crowds at the Minar." },
            { time: "02:00 PM", activity: "Humayun's Tomb", notes: "The precursor to the Taj Mahal architecture. Beautiful gardens." }
          ]
        },
        {
          day: 2,
          title: "Taj Mahal & Agra Fort",
          activities: [
            { time: "05:30 AM", activity: "Sunrise at Taj Mahal", notes: "Breathtaking views. Queue up at 5:00 AM at the East Gate." },
            { time: "11:00 AM", activity: "Agra Fort Exploration", notes: "Tour the red sandstone walled city of the Mughal Emperors." }
          ]
        },
        {
          day: 3,
          title: "The Pink City of Jaipur",
          activities: [
            { time: "10:00 AM", activity: "Amber Palace", notes: "Take a jeep up to the fort. Don't miss the Sheesh Mahal (Mirror Palace)." }
          ]
        }
      ]
    },
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    votes: [{ user_id: "user_1", vote_type: "upvote" }],
    verifications: [{ user_id: "user_2", is_real: true, is_accurate: true }],
    comments: []
  },
  // 2. AI Generated - International (Paris)
  {
    id: "mock-ai-2",
    user_id: "ai-planner",
    author_name: "Itinero AI",
    author_image: "",
    title: "Paris Highlights: Art, Icons & Romance",
    location: "Paris, France",
    duration_days: 4,
    budget: "Luxury",
    description: "A perfect 4-day loop in the City of Light. Covers world-class museums, panoramic view spots, and custom calendar schedules via Zapin.",
    content: {
      days: [
        {
          day: 1,
          title: "Sene River & Eiffel Tower",
          activities: [
            { time: "10:00 AM", activity: "Louvre Museum", notes: "Book tickets online weeks in advance. Focus on the Denon wing." },
            { time: "04:00 PM", activity: "Seine Cruise", notes: "Relaxing 1-hour cruise starting near the Eiffel Tower." }
          ]
        }
      ]
    },
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    votes: [],
    verifications: [],
    comments: []
  },
  // 3. AI Generated - National (Goa)
  {
    id: "mock-ai-3",
    user_id: "ai-planner",
    author_name: "Itinero AI",
    author_image: "",
    title: "Goa Beach & Culture Retreat",
    location: "Goa, India",
    duration_days: 3,
    budget: "Budget",
    description: "Relaxed 3-day itinerary focusing on South Goa's quiet beaches, heritage Portuguese quarters, and spice plantations.",
    content: {
      days: [
        {
          day: 1,
          title: "Panaji Heritage & Spice Farm",
          activities: [
            { time: "09:30 AM", activity: "Fontainhas Latin Quarter walk", notes: "Colorful Portuguese houses. Great for photography." },
            { time: "01:00 PM", activity: "Sahakari Spice Plantation Lunch", notes: "Enjoy a traditional Goan buffet lunch and spice tour." }
          ]
        }
      ]
    },
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    votes: [],
    verifications: [],
    comments: []
  },
  // 4. AI Generated - International (Iceland)
  {
    id: "mock-ai-4",
    user_id: "ai-planner",
    author_name: "Itinero AI",
    author_image: "",
    title: "Iceland South Coast & Glaciers",
    location: "Iceland",
    duration_days: 7,
    budget: "Luxury",
    description: "Legendary road trip across the Ring Road. Includes chasing waterfalls, walking on black sand beaches, and lagoon boat tours.",
    content: {
      days: [
        {
          day: 1,
          title: "The Golden Circle Route",
          activities: [
            { time: "09:00 AM", activity: "Thingvellir National Park", notes: "See the continental rift valley between Eurasia and North America." },
            { time: "01:00 PM", activity: "Geysir Geothermal Area", notes: "Watch Strokkur erupt scalding water every 6-10 minutes." }
          ]
        }
      ]
    },
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    votes: [],
    verifications: [],
    comments: []
  },
  // 5. User Generated - Community
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
        }
      ]
    },
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    votes: [
      { user_id: "user_2", vote_type: "upvote" },
      { user_id: "user_3", vote_type: "upvote" }
    ],
    verifications: [
      { user_id: "user_2", is_real: true, is_accurate: true }
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

// 1. GET ITINERARIES (with search, budget, duration, and author filters)
export async function getItineraries(query = "", filters = {}) {
  try {
    if (!isSupabaseConfigured()) {
      // Local Mock Filter Logic
      let result = [...MOCK_ITINERARIES];

      if (query) {
        const q = query.toLowerCase();
        result = result.filter(
          (it) => it.location.toLowerCase().includes(q) || 
                  it.title.toLowerCase().includes(q) ||
                  (it.description && it.description.toLowerCase().includes(q))
        );
      }

      if (filters.budget && filters.budget !== "All") {
        result = result.filter((it) => it.budget === filters.budget);
      }

      if (filters.tab === "ai") {
        result = result.filter((it) => it.user_id === "ai-planner");
      } else if (filters.tab === "community") {
        result = result.filter((it) => it.user_id !== "ai-planner");
      }

      if (filters.duration && filters.duration !== "All") {
        if (filters.duration === "short") {
          result = result.filter((it) => it.duration_days <= 3);
        } else if (filters.duration === "medium") {
          result = result.filter((it) => it.duration_days >= 4 && it.duration_days <= 7);
        } else if (filters.duration === "long") {
          result = result.filter((it) => it.duration_days >= 8);
        }
      }

      return result;
    }

    // Supabase Query Build
    let selectQuery = supabase
      .from("itineraries")
      .select(`
        *,
        itinerary_votes(user_id, vote_type),
        itinerary_verifications(user_id, is_real, is_accurate),
        comments(id)
      `);

    if (query) {
      selectQuery = selectQuery.or(`location.ilike.%${query}%,title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (filters.budget && filters.budget !== "All") {
      selectQuery = selectQuery.eq("budget", filters.budget);
    }

    if (filters.tab === "ai") {
      selectQuery = selectQuery.eq("user_id", "ai-planner");
    } else if (filters.tab === "community") {
      selectQuery = selectQuery.neq("user_id", "ai-planner");
    }

    if (filters.duration && filters.duration !== "All") {
      if (filters.duration === "short") {
        selectQuery = selectQuery.lte("duration_days", 3);
      } else if (filters.duration === "medium") {
        selectQuery = selectQuery.gte("duration_days", 4).lte("duration_days", 7);
      } else if (filters.duration === "long") {
        selectQuery = selectQuery.gte("duration_days", 8);
      }
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
    // fallback to mock local filters
    let result = [...MOCK_ITINERARIES];
    if (query) {
      result = result.filter((it) => it.location.toLowerCase().includes(query.toLowerCase()));
    }
    return result;
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
export async function addComment(itineraryId, commentContent, parentId = null) {
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
          parent_id: parentId,
          created_at: new Date().toISOString()
        });
      }
      return { success: true };
    }

    const insertData = {
      itinerary_id: itineraryId,
      user_id: userId,
      author_name: name,
      author_image: image,
      content: commentContent
    };
    
    if (parentId) {
      insertData.parent_id = parentId;
    }

    const { error } = await supabase
      .from("comments")
      .insert(insertData);

    if (error) throw error;

    revalidatePath(`/itinerary/${itineraryId}`);
    return { success: true };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { success: false, error: error.message };
  }
}
