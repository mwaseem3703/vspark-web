begin;
alter table public.upload_sessions add column if not exists drive_parent_id text;
create table if not exists public.drive_connections (
  id integer primary key check (id=1),
  account_email text not null,
  refresh_token_ciphertext text not null,
  connected_at timestamptz not null default now()
);
alter table public.drive_connections enable row level security;
revoke all on public.drive_connections from anon, authenticated;
grant all on public.drive_connections to service_role;
-- Keep the token and its destination in a single transaction.
create or replace function public.connect_personal_drive(encrypted_refresh_token text, connected_email text, destination_url text)
returns void language plpgsql security definer set search_path=public as $$
begin
  insert into public.drive_connections(id,account_email,refresh_token_ciphertext)
  values(1,connected_email,encrypted_refresh_token)
  on conflict(id) do update set account_email=excluded.account_email,refresh_token_ciphertext=excluded.refresh_token_ciphertext,connected_at=now();
  update public.competition_settings set google_drive_folder_url=destination_url,google_drive_verified_at=now(),submission_mode='closed',updated_at=now() where id=1;
end;
$$;
revoke all on function public.connect_personal_drive(text,text,text) from public,anon,authenticated;
grant execute on function public.connect_personal_drive(text,text,text) to service_role;
commit;
