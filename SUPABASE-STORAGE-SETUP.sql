-- Run once in Supabase Dashboard > SQL Editor.
-- Creates a public-read bucket for menu photos. Signed-in users can upload, replace, or delete files. If this Supabase project
-- has other non-admin accounts, tighten these policies to your admin-role rule.
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view menu photos" on storage.objects;
create policy "Public can view menu photos"
on storage.objects for select
to public
using (bucket_id = 'menu-images');

drop policy if exists "Authenticated users can upload menu photos" on storage.objects;
create policy "Authenticated users can upload menu photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'menu-images');

drop policy if exists "Authenticated users can update menu photos" on storage.objects;
create policy "Authenticated users can update menu photos"
on storage.objects for update
to authenticated
using (bucket_id = 'menu-images')
with check (bucket_id = 'menu-images');

drop policy if exists "Authenticated users can delete menu photos" on storage.objects;
create policy "Authenticated users can delete menu photos"
on storage.objects for delete
to authenticated
using (bucket_id = 'menu-images');
