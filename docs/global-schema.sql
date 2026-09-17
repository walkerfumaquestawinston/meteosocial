-- Target architecture: PostgreSQL + PostGIS. Not a D1 migration.
-- Run in a dedicated backend after configuring authentication and service roles.
create extension if not exists postgis;
create extension if not exists pgcrypto;
create schema if not exists meteo;

create table meteo.users (
 id uuid primary key,
 locale text not null default 'it-IT',
 home_country char(2),
 units text not null default 'metric' check (units in ('metric','us')),
 created_at timestamptz not null default now()
);
-- Private, opt-in location snapshot. Never include in public profile responses.
create table meteo.location_subscriptions (
 user_id uuid primary key references meteo.users on delete cascade,
 position geography(Point,4326) not null,
 accuracy_m real not null check (accuracy_m >= 0),
 consent_at timestamptz not null,
 observed_at timestamptz not null,
 expires_at timestamptz not null,
 check (expires_at > observed_at)
);
create index location_geo on meteo.location_subscriptions using gist(position);

create table meteo.media (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references meteo.users,
 object_key text not null unique,
 mime_type text not null,
 sha256 text not null,
 duration_ms integer check (duration_ms > 0),
 state text not null check (state in ('quarantined','processing','approved','rejected','deleted')),
 created_at timestamptz not null default now()
);
create index media_hash on meteo.media(sha256);
create table meteo.weather_reports (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references meteo.users,
 public_position geography(Point,4326) not null,
 country_code char(2) not null,
 geohash text not null,
 original_language text not null default 'und',
 description text not null,
 media_id uuid references meteo.media,
 observed_at timestamptz not null,
 received_at timestamptz not null default now(),
 tags text[] not null default '{}',
 verification_state text not null default 'unverified'
   check (verification_state in ('unverified','ai_assessed','corroborated','reviewed','rejected')),
 ai_confidence_score real check (ai_confidence_score between 0 and 1),
 calibration_version text,
 hail_diameter_mm real check (hail_diameter_mm > 0),
 measurement_method text,
 uncertainty_mm real check (uncertainty_mm >= 0),
 expires_at timestamptz not null,
 deleted_at timestamptz,
 check (expires_at > received_at),
 check (ai_confidence_score is null or calibration_version is not null),
 check (hail_diameter_mm is null or (measurement_method is not null and uncertainty_mm is not null))
);
create index reports_geo on meteo.weather_reports using gist(public_position);
create index reports_region_time on meteo.weather_reports(country_code,received_at desc,id);
create table meteo.ai_assessments (
 id uuid primary key default gen_random_uuid(),
 report_id uuid not null references meteo.weather_reports,
 model text not null,
 prompt_version text not null,
 evidence jsonb not null,
 limitations jsonb not null,
 created_at timestamptz not null default now()
);
create table meteo.covered_shelters (
 id uuid primary key default gen_random_uuid(),
 creator_id uuid not null references meteo.users,
 name text not null,
 position geography(Point,4326) not null,
 country_code char(2) not null,
 access_notes text not null,
 total_slots integer check (total_slots >= 0),
 available_slots integer check (available_slots >= 0),
 availability_observed_at timestamptz,
 availability_expires_at timestamptz,
 status text not null default 'unverified'
   check(status in ('unverified','verified_access','closed','removed')),
 evidence_source text,
 check (available_slots is null or (total_slots is not null and available_slots <= total_slots)),
 check (available_slots is null or (availability_observed_at is not null and availability_expires_at > availability_observed_at))
);
create index shelters_geo on meteo.covered_shelters using gist(position);

create table meteo.social_feed (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references meteo.users,
 report_id uuid references meteo.weather_reports,
 geohash text not null,
 original_language text not null,
 original_text text not null,
 media_id uuid references meteo.media,
 video_metadata jsonb,
 source_kind text not null check(source_kind in ('user','editorial','licensed_external')),
 provider text,
 provider_item_id text,
 source_url text,
 rights_basis text,
 rights_expires_at timestamptz,
 published_at timestamptz not null default now(),
 removed_at timestamptz,
 unique(provider,provider_item_id),
 check (source_kind <> 'licensed_external' or
   (provider is not null and source_url is not null and rights_basis is not null))
);
create index feed_page on meteo.social_feed(geohash,published_at desc,id);
create table meteo.translations (
 feed_id uuid not null references meteo.social_feed on delete cascade,
 locale text not null,
 content_hash text not null,
 translated_text text not null,
 subtitle_object_key text,
 model text not null,
 prompt_version text not null,
 created_at timestamptz not null default now(),
 primary key(feed_id,locale,content_hash)
);
create table meteo.historical_risk (
 id uuid primary key default gen_random_uuid(),
 geohash text not null,
 month smallint not null check(month between 1 and 12),
 risk_score smallint check(risk_score between 1 and 100),
 probability real check(probability between 0 and 1),
 lower_bound real check(lower_bound between 0 and 1),
 upper_bound real check(upper_bound between 0 and 1),
 observation_years smallint not null check(observation_years >= 0),
 coverage_fraction real not null check(coverage_fraction between 0 and 1),
 model_version text not null,
 dataset_version text not null,
 target_definition text not null,
 calculated_at timestamptz not null,
 valid_until timestamptz not null,
 unique(geohash,month,model_version,dataset_version),
 check (risk_score is null or (probability is not null and lower_bound is not null and upper_bound is not null)),
 check (lower_bound <= probability and probability <= upper_bound)
);

create table meteo.clans (
 id uuid primary key default gen_random_uuid(),
 country_code char(2) not null,
 area_key text not null,
 display_name text not null,
 unique(country_code,area_key)
);
create table meteo.clan_members (
 user_id uuid primary key references meteo.users,
 clan_id uuid not null references meteo.clans,
 joined_at timestamptz not null default now()
);
create table meteo.coin_ledger (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references meteo.users,
 amount integer not null check(amount <> 0),
 reason text not null,
 evidence_id uuid not null,
 idempotency_key text not null unique,
 reversal_of uuid unique references meteo.coin_ledger,
 created_at timestamptz not null default now()
);
-- StormCoins is derived; clients never update a balance directly.
create view meteo.user_balances as
 select u.id,coalesce(sum(l.amount),0) as storm_coins
 from meteo.users u left join meteo.coin_ledger l on l.user_id=u.id group by u.id;

create table meteo.cell_forecasts (
 id uuid primary key default gen_random_uuid(),
 provider text not null,
 cell_key text not null,
 run_at timestamptz not null,
 valid_at timestamptz not null,
 polygon geography(MultiPolygon,4326) not null,
 hazard text not null,
 probability real not null check(probability between 0 and 1),
 uncertainty_m real not null check(uncertainty_m >= 0),
 model_version text not null,
 unique(provider,cell_key,run_at,valid_at)
);
create index cell_forecasts_geo on meteo.cell_forecasts using gist(polygon);
create index cell_forecasts_time on meteo.cell_forecasts(valid_at);
create table meteo.notification_outbox (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references meteo.users,
 event_key text not null,
 locale text not null,
 payload jsonb not null,
 status text not null default 'pending'
   check(status in ('pending','leased','submitted','delivered','failed','cancelled')),
 lease_until timestamptz,
 attempts integer not null default 0,
 expires_at timestamptz not null,
 created_at timestamptz not null default now(),
 unique(user_id,event_key)
);
create table meteo.jobs (
 id uuid primary key default gen_random_uuid(),
 kind text not null,
 idempotency_key text not null unique,
 payload jsonb not null,
 state text not null default 'pending',
 lease_until timestamptz,
 attempts integer not null default 0,
 run_after timestamptz not null default now()
);
-- Default deny. Define narrowly scoped policies after binding JWT identity.
do $$ declare row record; begin
 for row in select tablename from pg_tables where schemaname='meteo' loop
   execute format('alter table meteo.%I enable row level security',row.tablename);
 end loop;
end $$;
revoke all on all tables in schema meteo from public;
revoke all on all sequences in schema meteo from public;
