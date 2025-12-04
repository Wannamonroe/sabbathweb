-- Create a table for user roles (if not exists)
create table if not exists public.user_roles (
  id uuid not null default gen_random_uuid(),
  user_id uuid references auth.users not null,
  role text not null check (role in ('superadmin', 'admin', 'no_access')),
  created_at timestamptz default now(),
  primary key (id),
  unique(user_id)
);

-- Enable Row Level Security
alter table public.user_roles enable row level security;

-- Helper function to check superadmin status without recursion
-- SECURITY DEFINER allows this function to run with the privileges of the creator (postgres), bypassing RLS
create or replace function public.is_superadmin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
    and role = 'superadmin'
  );
$$;

-- Create policies
-- Allow users to read their own role
drop policy if exists "Users can read their own role" on public.user_roles;
create policy "Users can read their own role"
  on public.user_roles for select
  using (auth.uid() = user_id);

-- Allow superadmins to read all roles (using the function to avoid recursion)
drop policy if exists "Superadmins can read all roles" on public.user_roles;
create policy "Superadmins can read all roles"
  on public.user_roles for select
  using ( is_superadmin() );

-- Insert initial Superadmins
-- chiirowley@gmail.com - UID: 1e00c27e-c984-4f95-bfc0-16acd1f12329
-- eponineimvu@gmail.com - UID: 521cd671-fed3-4b9e-9300-8b67a7eceb46

insert into public.user_roles (user_id, role)
values 
  ('1e00c27e-c984-4f95-bfc0-16acd1f12329', 'superadmin'),
  ('521cd671-fed3-4b9e-9300-8b67a7eceb46', 'superadmin')
on conflict (user_id) do update set role = EXCLUDED.role;
