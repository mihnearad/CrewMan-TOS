-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- PROFILES (Extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  role text default 'planner' check (role in ('admin', 'planner', 'viewer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROJECTS
create table projects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text not null, -- e.g., 'vessel', 'windfarm'
  status text default 'active' check (status in ('active', 'completed', 'cancelled', 'planned')),
  start_date date,
  end_date date,
  color text default '#3b82f6', -- For the calendar/timeline view
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CREW MEMBERS
create table crew_members (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  role text not null, -- e.g., 'Captain', 'Engineer', 'Deckhand'
  email text,
  phone text,
  status text default 'available' check (status in ('available', 'on_project', 'on_leave')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROJECT ASSIGNMENTS (The Planning Tool Core)
create table assignments (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  crew_member_id uuid references crew_members(id) on delete cascade not null,
  role_on_project text, -- Can override their default role
  start_date date not null,
  end_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Simple single-org setup: authenticated users can read/write all for now)
alter table profiles enable row level security;
alter table projects enable row level security;
alter table crew_members enable row level security;
alter table assignments enable row level security;

create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Authenticated users can view all projects" on projects for select to authenticated using (true);
create policy "Authenticated users can insert projects" on projects for insert to authenticated with check (true);
create policy "Authenticated users can update projects" on projects for update to authenticated using (true);
create policy "Authenticated users can delete projects" on projects for delete to authenticated using (true);

create policy "Authenticated users can view all crew" on crew_members for select to authenticated using (true);
create policy "Authenticated users can insert crew" on crew_members for insert to authenticated with check (true);
create policy "Authenticated users can update crew" on crew_members for update to authenticated using (true);
create policy "Authenticated users can delete crew" on crew_members for delete to authenticated using (true);

create policy "Authenticated users can view all assignments" on assignments for select to authenticated using (true);
create policy "Authenticated users can insert assignments" on assignments for insert to authenticated with check (true);
create policy "Authenticated users can update assignments" on assignments for update to authenticated using (true);
create policy "Authenticated users can delete assignments" on assignments for delete to authenticated using (true);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'planner');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
