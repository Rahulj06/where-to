-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Restaurants table
create table if not exists public.restaurants (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  slug                text unique not null,
  area                text not null,
  city                text not null default 'Mumbai',
  lat                 float not null,
  lng                 float not null,
  address             text,
  cuisines            text[] default '{}',
  tags                text[] default '{}',
  price_for_two       int,
  is_veg              boolean not null default false,
  must_try            text[] default '{}',
  notes               text,
  source              text not null default 'curated',
  status              text not null default 'verified',
  google_place_id     text,
  google_rating       float,
  google_reviews_count int,
  image_url           text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger restaurants_updated_at
  before update on public.restaurants
  for each row execute function public.set_updated_at();

-- Indexes for common filter queries
create index if not exists idx_restaurants_slug         on public.restaurants (slug);
create index if not exists idx_restaurants_area         on public.restaurants (area);
create index if not exists idx_restaurants_is_veg       on public.restaurants (is_veg);
create index if not exists idx_restaurants_google_rating on public.restaurants (google_rating desc nulls last);
create index if not exists idx_restaurants_cuisines     on public.restaurants using gin (cuisines);
create index if not exists idx_restaurants_tags         on public.restaurants using gin (tags);

-- Row Level Security
alter table public.restaurants enable row level security;

-- Allow public read access
create policy "Public read access"
  on public.restaurants
  for select
  to anon, authenticated
  using (true);

-- Only allow service role to insert/update/delete
create policy "Service role full access"
  on public.restaurants
  for all
  to service_role
  using (true)
  with check (true);

-- Discover: votes + random helpers (see migrations/002_discover.sql for incremental deploy)

do $$ begin
  create type public.vote_value as enum ('yes', 'no');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.votes (
  id              uuid primary key default gen_random_uuid(),
  restaurant_id   uuid not null references public.restaurants(id) on delete cascade,
  vote            public.vote_value not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_votes_restaurant_id on public.votes (restaurant_id);

alter table public.votes enable row level security;

create policy "Public insert votes"
  on public.votes for insert
  to anon, authenticated
  with check (true);

create policy "Public read votes"
  on public.votes for select
  to anon, authenticated
  using (true);

create or replace function public.random_restaurant(exclude_ids uuid[] default '{}')
returns setof public.restaurants
language sql
stable
as $$
  select *
  from public.restaurants
  where id != all(exclude_ids)
  order by random()
  limit 1;
$$;

grant execute on function public.random_restaurant(uuid[]) to anon, authenticated;

create or replace function public.random_restaurants(exclude_ids uuid[] default '{}', n int default 1)
returns setof public.restaurants
language sql
stable
as $$
  select *
  from public.restaurants
  where id != all(exclude_ids)
  order by random()
  limit greatest(1, least(n, 10));
$$;

grant execute on function public.random_restaurants(uuid[], int) to anon, authenticated;
