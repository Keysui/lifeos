-- AI-powered Life OS schema: Inbox capture, AI result caching, nutrition logs, and the
-- cross-module relationship graph. Run this against your Supabase project (SQL Editor, or
-- `supabase db push` if you link the CLI project).
--
-- This app has no authentication layer (no login/session -- see app-dashboard's history: an
-- earlier auth-backed version was deliberately removed). It's a single-user local tool, so
-- these tables are NOT scoped by auth.uid() the way a multi-tenant app's would be. RLS is
-- still enabled (Supabase flags public tables without it), but with an explicit "allow all"
-- policy -- that's a deliberate simplification for a single-user setup, not an oversight.
-- If this ever becomes multi-user, revisit these policies before relying on them.

-- ---------------------------------------------------------------------
-- inbox_notes: the capture system. The original note is never modified or deleted once
-- written -- only the ai_* columns get filled in asynchronously after AI extraction runs.
-- ---------------------------------------------------------------------
create table inbox_notes (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),

  -- Filled in by AI extraction after capture. Null until processed.
  ai_summary text,
  ai_key_ideas jsonb,
  ai_action_items jsonb,
  ai_projects_mentioned jsonb,
  ai_tasks_mentioned jsonb,
  ai_events_mentioned jsonb,
  ai_habits_mentioned jsonb,
  ai_people_mentioned jsonb,
  ai_suggestions jsonb, -- typed suggestion objects (create task/event/project/habit) awaiting user confirmation
  ai_processed_at timestamptz
);

alter table inbox_notes enable row level security;
create policy "inbox_notes_allow_all" on inbox_notes for all using (true) with check (true);

create index inbox_notes_created_at_idx on inbox_notes (created_at desc);

-- ---------------------------------------------------------------------
-- ai_cache: generic cache for AI-generated results (project status summaries, habit
-- insights, daily briefs, nutrition calculations, etc.), keyed by a hash of the source
-- content so a result is only regenerated when what it's based on actually changes.
-- One reusable table instead of a bespoke cache column per feature.
-- ---------------------------------------------------------------------
create table ai_cache (
  entity_type text not null, -- e.g. "project", "habit_set", "daily_brief", "nutrition"
  entity_id text not null,   -- e.g. a project id, "all" for a global analysis, or a date
  kind text not null,        -- e.g. "status_summary", "insights", "brief", "macros"
  content_hash text not null,
  result jsonb not null,
  generated_at timestamptz not null default now(),
  primary key (entity_type, entity_id, kind)
);

alter table ai_cache enable row level security;
create policy "ai_cache_allow_all" on ai_cache for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- nutrition_logs: meals logged (manually, pasted recipe, or future food-search/label-scan),
-- with Kimi-calculated macro/micronutrient breakdowns.
-- ---------------------------------------------------------------------
create table nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  meal_description text not null,
  source text not null default 'manual' check (source in ('manual', 'recipe', 'search')),
  calories int,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric,
  sugar_g numeric,
  sodium_mg numeric,
  micronutrients jsonb,
  created_at timestamptz not null default now()
);

alter table nutrition_logs enable row level security;
create policy "nutrition_logs_allow_all" on nutrition_logs for all using (true) with check (true);

create index nutrition_logs_date_idx on nutrition_logs (date desc);

-- ---------------------------------------------------------------------
-- knowledge_links: generic cross-module relationship graph (Inbox note -> Journal entry ->
-- Task -> Project -> Calendar event -> Knowledge note, etc.), so information never exists in
-- isolation. from_type/to_type + id pairs reference entities that mostly still live in
-- client-side Zustand stores today, not other Supabase tables -- this table is the join layer.
-- ---------------------------------------------------------------------
create table knowledge_links (
  id uuid primary key default gen_random_uuid(),
  from_type text not null,
  from_id text not null,
  to_type text not null,
  to_id text not null,
  relationship text not null default 'related',
  created_at timestamptz not null default now()
);

alter table knowledge_links enable row level security;
create policy "knowledge_links_allow_all" on knowledge_links for all using (true) with check (true);

create index knowledge_links_from_idx on knowledge_links (from_type, from_id);
create index knowledge_links_to_idx on knowledge_links (to_type, to_id);
