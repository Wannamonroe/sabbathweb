-- FIXED: Casting to bigint INSIDE the sum() function
create or replace function get_storage_usage()
returns bigint
language plpgsql
security definer
as $$
declare
  total_size bigint;
begin
  select sum((metadata->>'size')::bigint)
  into total_size
  from storage.objects;
  
  if total_size is null then
    total_size := 0;
  end if;
  
  return total_size;
end;
$$;
