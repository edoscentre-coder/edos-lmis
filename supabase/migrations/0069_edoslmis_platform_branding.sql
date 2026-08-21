-- EDOS LMIS — platform branding (the product logo shown in the app chrome)
--
-- Distinct from edoslmis_tenant_settings.logo_path, which is the individual
-- clinic's logo printed on their invoices and reports. This one is the EDOS
-- product mark in the sidebar, the mobile nav drawer, and the login page: one
-- value for the whole installation, identical for every tenant, and editable
-- only by a platform (super) admin.

create table if not exists edoslmis_platform_settings (
  -- Singleton: the check constraint pins the primary key to `true`, so a
  -- second row can never be inserted and readers can rely on there being at
  -- most one without filtering.
  id boolean primary key default true,
  app_logo_path text,
  updated_by uuid,
  updated_at timestamptz not null default now(),
  constraint edoslmis_platform_settings_singleton check (id)
);

insert into edoslmis_platform_settings (id) values (true) on conflict (id) do nothing;

drop trigger if exists edoslmis_trg_platform_settings_updated_at on edoslmis_platform_settings;
create trigger edoslmis_trg_platform_settings_updated_at
  before update on edoslmis_platform_settings
  for each row execute function edoslmis_set_updated_at();

alter table edoslmis_platform_settings enable row level security;

-- Readable by everyone, including anonymous visitors: the login page renders
-- this logo before anyone has signed in. The row holds nothing sensitive —
-- just a path into an already public-read storage bucket.
drop policy if exists edoslmis_platform_settings_select on edoslmis_platform_settings;
create policy edoslmis_platform_settings_select on edoslmis_platform_settings
  for select using (true);

drop policy if exists edoslmis_platform_settings_write on edoslmis_platform_settings;
create policy edoslmis_platform_settings_write on edoslmis_platform_settings
  for all using (edoshms_is_platform_admin())
  with check (edoshms_is_platform_admin());

-- ---------------------------------------------------------------------------
-- Storage: the product logo lives under the reserved "platform/" prefix of the
-- existing public-read branding bucket. The tenant policy from migration 0028
-- only grants writes under a folder named for the caller's tenant UUID, so it
-- can never match this prefix — hence a second, platform-admin-only policy.
-- ---------------------------------------------------------------------------
drop policy if exists edoslmis_branding_platform_write on storage.objects;
create policy edoslmis_branding_platform_write on storage.objects
  for all using (
    bucket_id = 'edoslmis-branding'
    and (storage.foldername(name))[1] = 'platform'
    and edoshms_is_platform_admin()
  ) with check (
    bucket_id = 'edoslmis-branding'
    and (storage.foldername(name))[1] = 'platform'
    and edoshms_is_platform_admin()
  );
