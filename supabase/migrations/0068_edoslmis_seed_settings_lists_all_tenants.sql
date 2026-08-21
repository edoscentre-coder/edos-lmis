-- EDOS LMIS — every tenant gets the standard classification lists, not just
-- the one that existed when 0033/0036 were written.
--
-- 0033 (inventory_category, equipment_type) and 0036 (payment_method,
-- histopathology_stain) seeded edoslmis_settings_lists against a single
-- hardcoded tenant id. Every tenant onboarded since starts with zero rows in
-- all four lists, and because these lists are what the pickers render, the
-- dropdowns come up completely empty — no options, nothing to choose, and on
-- the payment forms the submit then fails with "Enter a valid payment method
-- and amount" because the select had no value to post. Observed on the
-- supplier-bill Record Payment form, but it hits every picker fed by
-- getSettingsList: Method (patient billing, supplier bills, bulk supplier
-- pay), Inventory Category (new/edit item, new/edit test), Equipment Type
-- (new/edit equipment) and Histopathology Stain.
--
-- Fix is in two parts: a reusable seeding function applied to all existing
-- tenants, plus a trigger so a newly created tenant is seeded on the spot
-- instead of quietly inheriting the same empty pickers.
--
-- The seed is per (tenant, list_key) and only fires when that tenant has NO
-- rows at all for the key. That deliberately does not "repair" a list an
-- admin has already curated from /settings — a tenant that hard-deleted
-- Cheque, or unchecked NHIF, keeps it gone rather than having it silently
-- reappear on migrate. Same reasoning as 0033: these values are display
-- classifications, never FK targets and never branched on, so the only thing
-- at stake is what shows up in a picker.

-- ---------------------------------------------------------------------------
-- The canonical defaults — kept identical to what 0033/0036 seeded, so a
-- freshly seeded tenant's pickers look exactly like the original tenant's.
-- ---------------------------------------------------------------------------
-- Returns text rather than varchar(n) on purpose: the literals below are text,
-- and the insert into edoslmis_settings_lists casts them down to the column's
-- varchar widths on its own. Declaring varchar here just invites a return-type
-- mismatch for no benefit.
create or replace function edoslmis_default_settings_list_entries()
returns table (list_key text, value text, label text, sort_order int)
language sql
immutable
as $$
  select * from (values
    ('payment_method',       'cash',              'Cash',              1),
    ('payment_method',       'mpesa',             'M-Pesa',            2),
    ('payment_method',       'card',              'Card',              3),
    ('payment_method',       'bank_transfer',     'Bank Transfer',     4),
    ('payment_method',       'cheque',            'Cheque',            5),
    ('payment_method',       'insurance',         'Insurance',         6),
    ('payment_method',       'nhif',              'NHIF',              7),
    ('payment_method',       'sha',               'SHA',               8),

    ('inventory_category',   'reagent',           'Reagent',           1),
    ('inventory_category',   'consumable',        'Consumable',        2),
    ('inventory_category',   'glassware',         'Glassware',         3),
    ('inventory_category',   'chemical',          'Chemical',          4),
    ('inventory_category',   'kit',               'Kit',               5),
    ('inventory_category',   'calibrator',        'Calibrator',        6),
    ('inventory_category',   'control',           'Control',           7),
    ('inventory_category',   'other',             'Other',             8),

    ('equipment_type',       'analyzer',          'Analyzer',          1),
    ('equipment_type',       'microscope',        'Microscope',        2),
    ('equipment_type',       'centrifuge',        'Centrifuge',        3),
    ('equipment_type',       'incubator',         'Incubator',         4),
    ('equipment_type',       'refrigerator',      'Refrigerator',      5),
    ('equipment_type',       'freezer',           'Freezer',           6),
    ('equipment_type',       'autoclave',         'Autoclave',         7),
    ('equipment_type',       'water_bath',        'Water Bath',        8),
    ('equipment_type',       'pipette',           'Pipette',           9),
    ('equipment_type',       'balance',           'Balance',          10),
    ('equipment_type',       'pcr_machine',       'PCR Machine',      11),
    ('equipment_type',       'blood_bank_fridge', 'Blood Bank Fridge',12),
    ('equipment_type',       'other',             'Other',            13),

    ('histopathology_stain', 'H&E',               'H&E',               1),
    ('histopathology_stain', 'PAS',               'PAS',               2),
    ('histopathology_stain', 'Special stain',     'Special stain',     3),
    ('histopathology_stain', 'IHC',               'IHC',               4)
  ) as d(list_key, value, label, sort_order);
$$;

-- ---------------------------------------------------------------------------
-- Seed one tenant. security definer because the trigger below runs during a
-- platform-admin tenant insert, where edoslmis_settings_lists_write (which
-- demands edoslmis_is_admin_for on an as-yet staff-less tenant) would
-- otherwise reject the rows.
-- ---------------------------------------------------------------------------
create or replace function edoslmis_seed_default_settings_lists(p_tenant_id uuid)
returns int
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_inserted int;
begin
  insert into edoslmis_settings_lists (tenant_id, list_key, value, label, sort_order)
  select p_tenant_id, d.list_key, d.value, d.label, d.sort_order
  from edoslmis_default_settings_list_entries() d
  where not exists (
    select 1
    from edoslmis_settings_lists existing
    where existing.tenant_id = p_tenant_id
      and existing.list_key = d.list_key
  )
  on conflict (tenant_id, list_key, value) do nothing;

  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

-- ---------------------------------------------------------------------------
-- Backfill every tenant that exists today.
-- ---------------------------------------------------------------------------
do $$
declare
  t record;
  n int;
begin
  for t in select id, name from edoshms_tenants loop
    n := edoslmis_seed_default_settings_lists(t.id);
    if n > 0 then
      raise notice 'seeded % settings-list entries for tenant %', n, t.name;
    end if;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- And for every tenant created from here on.
--
-- This trigger lives on edoshms_tenants, which belongs to the HMS side, so it
-- swallows its own errors deliberately: an after-insert trigger raising here
-- would abort the whole tenant insert and take tenant creation down with it.
-- An LMIS picklist is never worth that. A failed seed degrades to exactly
-- today's behaviour — empty pickers, fixable by re-running the backfill block
-- above — and leaves a warning in the Postgres log saying so.
-- ---------------------------------------------------------------------------
create or replace function edoslmis_seed_settings_lists_for_new_tenant()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  begin
    perform edoslmis_seed_default_settings_lists(new.id);
  exception when others then
    raise warning 'edoslmis: could not seed default settings lists for tenant % (%): %',
      new.id, sqlstate, sqlerrm;
  end;
  return new;
end;
$$;

drop trigger if exists edoslmis_seed_settings_lists_after_tenant_insert on edoshms_tenants;
create trigger edoslmis_seed_settings_lists_after_tenant_insert
  after insert on edoshms_tenants
  for each row
  execute function edoslmis_seed_settings_lists_for_new_tenant();
