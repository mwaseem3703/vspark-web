-- Additive change: preserves the current competition and participant data.
begin;
alter table public.competition_settings
  add column if not exists google_drive_folder_url text not null default '',
  add column if not exists google_drive_verified_at timestamptz;
commit;
