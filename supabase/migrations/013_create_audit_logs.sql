-- Create audit logs table for tracking all CRUD operations
create table public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  table_name text not null,
  record_id uuid not null,
  action text not null check (action in ('CREATE', 'UPDATE', 'DELETE')),
  old_values jsonb,
  new_values jsonb,
  changed_fields text[],
  user_id uuid references auth.users(id) on delete set null,
  user_email text not null,
  ip_address text,
  user_agent text,
  created_at timestamptz default now() not null
);

-- Create indexes for efficient querying
create index idx_audit_logs_table_record on public.audit_logs(table_name, record_id);
create index idx_audit_logs_created_at on public.audit_logs(created_at desc);
create index idx_audit_logs_user_id on public.audit_logs(user_id);
create index idx_audit_logs_action on public.audit_logs(action);

-- Enable RLS
alter table public.audit_logs enable row level security;

-- Policy: Only admins can read audit logs
create policy "Admins can view audit logs"
  on public.audit_logs
  for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Policy: Authenticated users can insert audit logs (via server actions)
create policy "Authenticated users can insert audit logs"
  on public.audit_logs
  for insert
  with check (auth.uid() is not null);

-- Add comment for documentation
comment on table public.audit_logs is 'Comprehensive audit trail tracking all CRUD operations across the application';
