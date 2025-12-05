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

-- Function to get all users with their roles
-- Returns a JSON object to easily handle in frontend
create or replace function public.get_users_with_roles()
returns table (
  user_id uuid,
  email varchar,
  role text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Check if the requesting user is a superadmin
  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'superadmin'
  ) then
    raise exception 'Access denied';
  end if;

  return query
  select 
    au.id as user_id,
    au.email::varchar,
    coalesce(ur.role, 'no_access') as role,
    au.created_at
  from auth.users au
  left join public.user_roles ur on au.id = ur.user_id
  order by au.created_at desc;
end;
$$;

-- Function to update user role
create or replace function public.update_user_role_by_superadmin(
  target_user_id uuid,
  new_role text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 1. Check if requester is superadmin
  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'superadmin'
  ) then
    raise exception 'Access denied';
  end if;

  -- 2. Check if target user is a superadmin (PROTECTION)
  if exists (
    select 1 from public.user_roles ur
    where ur.user_id = target_user_id and ur.role = 'superadmin'
  ) then
    raise exception 'Cannot modify a Superadmin';
  end if;

  -- 3. Validate new role
  if new_role not in ('superadmin', 'admin', 'no_access') then
    raise exception 'Invalid role';
  end if;

  -- 4. Update or Insert role
  insert into public.user_roles (user_id, role)
  values (target_user_id, new_role)
  on conflict (user_id) do update
  set role = EXCLUDED.role;
end;
$$;

-- Function to delete user
create or replace function public.delete_user_by_superadmin(
  target_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 1. Check if requester is superadmin
  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'superadmin'
  ) then
    raise exception 'Access denied';
  end if;

  -- 2. Check if target user is a superadmin (PROTECTION)
  if exists (
    select 1 from public.user_roles ur
    where ur.user_id = target_user_id and ur.role = 'superadmin'
  ) then
    raise exception 'Cannot delete a Superadmin';
  end if;

  -- 3. Delete from auth.users (Cascades to user_roles usually, but let's be safe)
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

-- Function to get all users with their roles
-- Returns a JSON object to easily handle in frontend
create or replace function public.get_users_with_roles()
returns table (
  user_id uuid,
  email varchar,
  role text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Check if the requesting user is a superadmin
  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'superadmin'
  ) then
    raise exception 'Access denied';
  end if;

  return query
  select 
    au.id as user_id,
    au.email::varchar,
    coalesce(ur.role, 'no_access') as role,
    au.created_at
  from auth.users au
  left join public.user_roles ur on au.id = ur.user_id
  order by au.created_at desc;
end;
$$;

-- Function to update user role
create or replace function public.update_user_role_by_superadmin(
  target_user_id uuid,
  new_role text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 1. Check if requester is superadmin
  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'superadmin'
  ) then
    raise exception 'Access denied';
  end if;

  -- 2. Check if target user is a superadmin (PROTECTION)
  if exists (
    select 1 from public.user_roles ur
    where ur.user_id = target_user_id and ur.role = 'superadmin'
  ) then
    raise exception 'Cannot modify a Superadmin';
  end if;

  -- 3. Validate new role
  if new_role not in ('superadmin', 'admin', 'no_access') then
    raise exception 'Invalid role';
  end if;

  -- 4. Update or Insert role
  insert into public.user_roles (user_id, role)
  values (target_user_id, new_role)
  on conflict (user_id) do update
  set role = EXCLUDED.role;
end;
$$;

-- Function to delete user
create or replace function public.delete_user_by_superadmin(
  target_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 1. Check if requester is superadmin
  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'superadmin'
  ) then
    raise exception 'Access denied';
  end if;

  -- 2. Check if target user is a superadmin (PROTECTION)
  if exists (
    select 1 from public.user_roles ur
    where ur.user_id = target_user_id and ur.role = 'superadmin'
  ) then
    raise exception 'Cannot delete a Superadmin';
  end if;

  -- 3. Delete from auth.users (Cascades to user_roles usually, but let's be safe)
  -- Note: This requires the Postgres role to have permissions on auth.users, 
  -- which SECURITY DEFINER usually grants if the creator (postgres) has it.
  delete from auth.users where id = target_user_id;
end;
$$;

-- Enable pgcrypto for password hashing
create extension if not exists pgcrypto with schema public;

-- Function to create a new user by superadmin
create or replace function public.create_user_by_superadmin(
  new_email text,
  new_password text,
  new_role text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  new_user_id uuid;
begin
  -- 1. Check if requester is superadmin
  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'superadmin'
  ) then
    raise exception 'Access denied';
  end if;

  -- 2. Validate role
  if new_role not in ('superadmin', 'admin', 'no_access') then
    raise exception 'Invalid role';
  end if;

  -- 3. Check if email already exists
  if exists (select 1 from auth.users where email = new_email) then
    raise exception 'Email already exists';
  end if;

  -- 4. Generate new User ID
  new_user_id := gen_random_uuid();

  -- 5. Insert into auth.users
  -- We need to manually handle password hashing and required fields
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', -- Default instance_id
    new_user_id,
    'authenticated',
    'authenticated',
    new_email,
    crypt(new_password, gen_salt('bf')), -- Hash password
    now(), -- Auto-confirm email
    null,
    null,
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- 6. Insert into public.user_roles
  insert into public.user_roles (user_id, role)
  values (new_user_id, new_role);

  -- 7. Insert into auth.identities (Required for login to work properly in some versions, though email/password might be enough)
  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    new_user_id,
    format('{"sub": "%s", "email": "%s"}', new_user_id::text, new_email)::jsonb,
    'email',
    null,
    now(),
    now()
  );

end;
$$;