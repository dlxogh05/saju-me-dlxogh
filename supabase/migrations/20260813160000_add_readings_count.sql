create function private.get_readings_count()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.readings;
$$;

revoke all on function private.get_readings_count() from public;
grant execute on function private.get_readings_count() to anon, authenticated;

create function public.get_readings_count()
returns bigint
language sql
stable
security invoker
set search_path = public
as $$
  select private.get_readings_count();
$$;

revoke all on function public.get_readings_count() from public;
grant execute on function public.get_readings_count() to anon, authenticated;
