create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_locale text not null default 'tr-TR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vehicles_payload_object check (jsonb_typeof(payload) = 'object')
);

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  input jsonb not null,
  result jsonb not null,
  created_at timestamptz not null default now(),
  constraint analyses_input_object check (jsonb_typeof(input) = 'object'),
  constraint analyses_result_object check (jsonb_typeof(result) = 'object')
);

create table if not exists public.photo_analyses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  image_digest text not null,
  metadata jsonb not null default '{}'::jsonb,
  result jsonb not null,
  created_at timestamptz not null default now(),
  constraint photo_analyses_metadata_object check (jsonb_typeof(metadata) = 'object'),
  constraint photo_analyses_result_object check (jsonb_typeof(result) = 'object')
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete cascade,
  title text not null,
  due_at timestamptz not null,
  status text not null default 'scheduled',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reminders_status_check check (status in ('scheduled', 'sent', 'done', 'cancelled')),
  constraint reminders_payload_object check (jsonb_typeof(payload) = 'object')
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  endpoint_hash text not null,
  subscription jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, endpoint_hash),
  constraint push_subscriptions_subscription_object check (jsonb_typeof(subscription) = 'object')
);

create table if not exists public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  install_hash text,
  feature text not null,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint ai_usage_feature_check check (feature in ('analysis_note', 'photo_damage')),
  constraint ai_usage_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table if not exists public.iap_entitlements (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  original_transaction_id text not null,
  product_id text not null,
  tier text not null,
  status text not null,
  expires_at timestamptz,
  signed_at timestamptz not null default now(),
  raw_notification jsonb,
  unique (original_transaction_id),
  constraint iap_entitlements_tier_check check (tier in ('pro', 'pro_plus')),
  constraint iap_entitlements_status_check check (status in ('active', 'expired', 'revoked', 'grace_period'))
);

create table if not exists public.feedback_notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  category text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint feedback_notes_category_check check (category in ('ui', 'rule', 'bug', 'other')),
  constraint feedback_notes_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index if not exists vehicles_owner_id_created_at_idx on public.vehicles(owner_id, created_at desc);
create index if not exists analyses_owner_id_created_at_idx on public.analyses(owner_id, created_at desc);
create index if not exists analyses_vehicle_id_created_at_idx on public.analyses(vehicle_id, created_at desc);
create index if not exists photo_analyses_owner_id_created_at_idx on public.photo_analyses(owner_id, created_at desc);
create index if not exists reminders_owner_id_due_at_idx on public.reminders(owner_id, due_at);
create index if not exists ai_usage_events_install_feature_time_idx on public.ai_usage_events(install_hash, feature, occurred_at desc);
create index if not exists iap_entitlements_owner_id_status_idx on public.iap_entitlements(owner_id, status);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists vehicles_set_updated_at on public.vehicles;
create trigger vehicles_set_updated_at before update on public.vehicles
for each row execute function public.set_updated_at();

drop trigger if exists reminders_set_updated_at on public.reminders;
create trigger reminders_set_updated_at before update on public.reminders
for each row execute function public.set_updated_at();

drop trigger if exists push_subscriptions_set_updated_at on public.push_subscriptions;
create trigger push_subscriptions_set_updated_at before update on public.push_subscriptions
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.analyses enable row level security;
alter table public.photo_analyses enable row level security;
alter table public.reminders enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.ai_usage_events enable row level security;
alter table public.iap_entitlements enable row level security;
alter table public.feedback_notes enable row level security;

create policy "profiles_owner_select" on public.profiles
for select using (auth.uid() = id);
create policy "profiles_owner_insert" on public.profiles
for insert with check (auth.uid() = id);
create policy "profiles_owner_update" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "vehicles_owner_all" on public.vehicles
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "analyses_owner_all" on public.analyses
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "photo_analyses_owner_all" on public.photo_analyses
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "reminders_owner_all" on public.reminders
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "push_subscriptions_owner_all" on public.push_subscriptions
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "ai_usage_owner_select" on public.ai_usage_events
for select using (auth.uid() = owner_id);
create policy "ai_usage_owner_insert" on public.ai_usage_events
for insert with check (auth.uid() = owner_id or owner_id is null);

create policy "iap_entitlements_owner_select" on public.iap_entitlements
for select using (auth.uid() = owner_id);

create policy "feedback_notes_owner_select" on public.feedback_notes
for select using (auth.uid() = owner_id);
create policy "feedback_notes_owner_insert" on public.feedback_notes
for insert with check (auth.uid() = owner_id or owner_id is null);
