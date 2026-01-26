-- Add updated_at columns to all main tables for tracking modification times

-- Add updated_at to crew_members
alter table public.crew_members
  add column updated_at timestamptz default now() not null;

-- Add updated_at to projects
alter table public.projects
  add column updated_at timestamptz default now() not null;

-- Add updated_at to assignments
alter table public.assignments
  add column updated_at timestamptz default now() not null;

-- Add updated_at to clients
alter table public.clients
  add column updated_at timestamptz default now() not null;

-- Add updated_at to consultants
alter table public.consultants
  add column updated_at timestamptz default now() not null;

-- Add updated_at to crew_roles
alter table public.crew_roles
  add column updated_at timestamptz default now() not null;

-- Create function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create triggers for all tables
create trigger set_updated_at
  before update on public.crew_members
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.projects
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.assignments
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.clients
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.consultants
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.crew_roles
  for each row
  execute function public.handle_updated_at();
