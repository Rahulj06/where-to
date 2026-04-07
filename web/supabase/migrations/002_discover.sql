-- Discover mode: cover images + votes

alter table public.restaurants add column if not exists image_url text;

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

-- Random restaurant (optionally excluding ids)
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
