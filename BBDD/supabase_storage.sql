-- Create a new storage bucket for round images
insert into storage.buckets (id, name, public)
values ('round-images', 'round-images', true);

-- Allow public access to view images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'round-images' );

-- Allow authenticated users (admins) to upload images
create policy "Authenticated users can upload images"
on storage.objects for insert
with check ( bucket_id = 'round-images' and auth.role() = 'authenticated' );

-- Allow authenticated users (admins) to update images
create policy "Authenticated users can update images"
on storage.objects for update
with check ( bucket_id = 'round-images' and auth.role() = 'authenticated' );

-- Allow authenticated users (admins) to delete images
create policy "Authenticated users can delete images"
on storage.objects for delete
using ( bucket_id = 'round-images' and auth.role() = 'authenticated' );

-- Function to get total size of files in storage buckets
create or replace function get_storage_usage()
returns bigint
language plpgsql
security definer
as $$
declare
  total_size bigint;
begin
  select sum(metadata->>'size')::bigint
  into total_size
  from storage.objects;
  
  if total_size is null then
    total_size := 0;
  end if;
  
  return total_size;
end;
$$;
