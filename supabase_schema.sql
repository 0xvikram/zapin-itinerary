-- Database schema for Zapin Itinerary Hub
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Itineraries Table
create table public.itineraries (
    id uuid default uuid_generate_v4() primary key,
    user_id text not null, -- Clerk user ID
    author_name text not null,
    author_image text,
    title text not null,
    location text not null,
    duration_days integer not null,
    budget text not null, -- e.g., 'Budget', 'Mid-range', 'Luxury'
    description text,
    content jsonb not null, -- { days: [{ day: 1, title: "", activities: [{ time: "", activity: "", notes: "" }] }] }
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Indexing for locations to speed up search
create index if not exists itineraries_location_idx on public.itineraries using gin (to_tsvector('english', location));
create index if not exists itineraries_location_lower_idx on public.itineraries (lower(location));

-- 2. Votes Table
create table public.itinerary_votes (
    itinerary_id uuid references public.itineraries(id) on delete cascade,
    user_id text not null, -- Clerk user ID
    vote_type text not null check (vote_type in ('upvote', 'downvote')),
    created_at timestamp with time zone default now() not null,
    primary key (itinerary_id, user_id)
);

-- 3. Verifications Table
create table public.itinerary_verifications (
    itinerary_id uuid references public.itineraries(id) on delete cascade,
    user_id text not null, -- Clerk user ID
    is_real boolean default false not null,
    is_accurate boolean default false not null,
    created_at timestamp with time zone default now() not null,
    primary key (itinerary_id, user_id)
);

-- 4. Comments Table
create table public.comments (
    id uuid default uuid_generate_v4() primary key,
    itinerary_id uuid references public.itineraries(id) on delete cascade,
    user_id text not null, -- Clerk user ID
    author_name text not null,
    author_image text,
    content text not null,
    parent_id uuid references public.comments(id) on delete cascade, -- Support threaded replies
    created_at timestamp with time zone default now() not null
);

-- Enable Row Level Security (RLS)
alter table public.itineraries enable row level security;
alter table public.itinerary_votes enable row level security;
alter table public.itinerary_verifications enable row level security;
alter table public.comments enable row level security;

-- Policies for Itineraries
create policy "Allow public read access to itineraries" on public.itineraries
    for select using (true);

create policy "Allow authenticated users to insert itineraries" on public.itineraries
    for insert with check (true); -- Authenticated validation handled on server actions/API level

create policy "Allow users to update their own itineraries" on public.itineraries
    for update using (true); -- User matching verified in code

create policy "Allow users to delete their own itineraries" on public.itineraries
    for delete using (true); -- User matching verified in code

-- Policies for Votes
create policy "Allow public read access to votes" on public.itinerary_votes
    for select using (true);

create policy "Allow all users to manage their votes" on public.itinerary_votes
    for all using (true);

-- Policies for Verifications
create policy "Allow public read access to verifications" on public.itinerary_verifications
    for select using (true);

create policy "Allow all users to manage verifications" on public.itinerary_verifications
    for all using (true);

-- Policies for Comments
create policy "Allow public read access to comments" on public.comments
    for select using (true);

create policy "Allow all users to manage comments" on public.comments
    for all using (true);

-- 5. Feedback Table (For suggestions, bug reports, and reviews)
create table public.feedback (
    id uuid default uuid_generate_v4() primary key,
    user_id text, -- Clerk user ID (optional if anonymous)
    email text not null,
    category text not null, -- 'Suggestion', 'Bug Report', 'Feature Request', etc.
    content text not null,
    created_at timestamp with time zone default now() not null
);

alter table public.feedback enable row level security;

create policy "Allow public insert to feedback" on public.feedback
    for insert with check (true);

create policy "Allow authenticated read access to feedback" on public.feedback
    for select using (true);
