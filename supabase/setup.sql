-- Descanso Comida • Cafe website content table
-- 1) Create an admin user in Supabase Dashboard > Authentication > Users.
-- 2) Copy that user's UUID and replace ADMIN_USER_UUID below.
-- 3) Run this entire script in SQL Editor.
create table if not exists public.descanso_site (
  id integer primary key check (id = 1),
  owner_id uuid not null references auth.users(id) on delete restrict,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.descanso_site enable row level security;
revoke all on public.descanso_site from anon, authenticated;
grant select on public.descanso_site to anon, authenticated;
grant update (content, updated_at) on public.descanso_site to authenticated;
drop policy if exists "Public can read cafe website content" on public.descanso_site;
create policy "Public can read cafe website content"
on public.descanso_site for select to anon, authenticated using (true);
drop policy if exists "Only site owner can update cafe website content" on public.descanso_site;
create policy "Only site owner can update cafe website content"
on public.descanso_site for update to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);
insert into public.descanso_site (id, owner_id, content)
values (1, 'ADMIN_USER_UUID'::uuid, '{}'::jsonb)
on conflict (id) do nothing;
