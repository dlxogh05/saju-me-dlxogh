alter table public.readings
  add column share_id uuid not null default gen_random_uuid();

create unique index readings_share_id_idx on public.readings (share_id);

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to postgres, service_role, anon, authenticated;

create function private.get_shared_reading(p_share_id uuid)
returns table (
  name text,
  result text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select p.name, r.result, r.created_at
  from public.readings r
  inner join public.profiles p on p.id = r.user_id
  where r.share_id = p_share_id
  limit 1;
$$;

revoke all on function private.get_shared_reading(uuid) from public;
grant execute on function private.get_shared_reading(uuid) to anon, authenticated;

create function public.get_shared_reading(p_share_id uuid)
returns table (
  name text,
  result text,
  created_at timestamptz
)
language sql
stable
security invoker
set search_path = public
as $$
  select name, result, created_at
  from private.get_shared_reading(p_share_id);
$$;

revoke all on function public.get_shared_reading(uuid) from public;
grant execute on function public.get_shared_reading(uuid) to anon, authenticated;
