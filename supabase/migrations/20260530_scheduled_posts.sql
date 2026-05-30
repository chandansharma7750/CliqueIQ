-- ============================================================
-- scheduled_posts table
-- ============================================================
create table if not exists public.scheduled_posts (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  platform      text not null,          -- instagram | facebook | youtube | linkedin
  caption       text not null default '',
  image_url     text,                   -- Supabase Storage URL (optional)
  scheduled_at  timestamptz not null,   -- when to publish
  status        text not null default 'scheduled',  -- scheduled | published | failed | draft
  published_at  timestamptz,
  error_message text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Index for fast workspace queries
create index if not exists idx_scheduled_posts_workspace
  on public.scheduled_posts(workspace_id, scheduled_at desc);

-- RLS
alter table public.scheduled_posts enable row level security;

create policy "Users can manage their workspace posts"
  on public.scheduled_posts
  for all
  using (
    workspace_id in (
      select id from public.workspaces where owner_id = auth.uid()
    )
  );

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists scheduled_posts_updated_at on public.scheduled_posts;
create trigger scheduled_posts_updated_at
  before update on public.scheduled_posts
  for each row execute function public.update_updated_at();
