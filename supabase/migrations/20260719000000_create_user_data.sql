create table if not exists public.makerpath_user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.makerpath_user_data enable row level security;

create policy "Users can read their MakerPath data"
on public.makerpath_user_data
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their MakerPath data"
on public.makerpath_user_data
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their MakerPath data"
on public.makerpath_user_data
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
