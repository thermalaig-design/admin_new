create table public.app_templates (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  primary_color text not null default '#C0241A'::text,
  secondary_color text not null default '#2B2F7E'::text,
  accent_color text not null default '#FDECEA'::text,
  accent_bg text not null default '#EAEBF8'::text,
  navbar_bg text not null default 'rgba(234,235,248,0.88)'::text,
  page_bg text not null default 'linear-gradient(160deg,#fff5f5 0%,#ffffff 50%,#f0f1fb 100%)'::text,
  home_layout jsonb not null default '["gallery", "quickActions", "sponsors"]'::jsonb,
  animations jsonb not null default '{"cards": "fadeUp", "navbar": "fadeSlideDown", "gallery": "zoomIn"}'::jsonb,
  custom_css text null default ''::text,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  template_key text not null default 'mahila'::text,
  trust_id text null,
  constraint app_templates_pkey primary key (id),
  constraint app_templates_name_key unique (name)
) tablespace pg_default;

create trigger app_templates_updated_at before
update on app_templates for each row
execute function update_updated_at ();

create table public."Trust" (
  id uuid not null default gen_random_uuid (),
  name text not null,
  icon_url text null,
  remark text null,
  created_at timestamp with time zone null default now(),
  terms_content text null,
  privacy_content text null,
  template_id uuid null,
  theme_overrides jsonb null default '{}'::jsonb,
  legal_name text null,
  superuser_id uuid null,
  constraint hospitals_pkey primary key (id),
  constraint "Trust_superuser_id_fkey" foreign key (superuser_id) references superuser (id) on delete set null,
  constraint "Trust_template_id_fkey" foreign key (template_id) references app_templates (id) on delete set null
) tablespace pg_default;
