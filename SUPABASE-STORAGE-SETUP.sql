-- Supabase Storage setup for menu photos.
-- Creates a public-read bucket. Only the configured cafe owner can upload,
-- replace, or delete menu photos.

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view menu photos" on storage.objects;
create policy "Public can view menu photos"
on storage.objects for select
to public
using (bucket_id = 'menu-images');

drop policy if exists "Authenticated users can upload menu photos" on storage.objects;
drop policy if exists "Cafe owner can upload menu photos" on storage.objects;
create policy "Cafe owner can upload menu photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'menu-images'
  and auth.uid() = (select owner_id from public.descanso_site where id = 1)
);

drop policy if exists "Authenticated users can update menu photos" on storage.objects;
drop policy if exists "Cafe owner can update menu photos" on storage.objects;
create policy "Cafe owner can update menu photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'menu-images'
  and auth.uid() = (select owner_id from public.descanso_site where id = 1)
)
with check (
  bucket_id = 'menu-images'
  and auth.uid() = (select owner_id from public.descanso_site where id = 1)
);

drop policy if exists "Authenticated users can delete menu photos" on storage.objects;
drop policy if exists "Cafe owner can delete menu photos" on storage.objects;
create policy "Cafe owner can delete menu photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'menu-images'
  and auth.uid() = (select owner_id from public.descanso_site where id = 1)
);
