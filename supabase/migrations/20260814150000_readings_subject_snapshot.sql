alter table public.readings
  add column subject_name text,
  add column subject_birth date,
  add column subject_birth_time text,
  add column subject_gender text,
  add column subject_calendar text;

update public.readings r
set
  subject_name = p.name,
  subject_birth = p.birth,
  subject_birth_time = p.birth_time,
  subject_gender = p.gender,
  subject_calendar = p.calendar
from public.profiles p
where p.id = r.user_id;

alter table public.readings
  alter column subject_name set not null,
  alter column subject_birth set not null,
  alter column subject_birth_time set not null,
  alter column subject_gender set not null,
  alter column subject_calendar set not null,
  add constraint readings_subject_gender_check
    check (subject_gender in ('male', 'female')),
  add constraint readings_subject_calendar_check
    check (subject_calendar in ('양력', '음력'));

drop function if exists public.get_shared_reading(uuid);
drop function if exists private.get_shared_reading(uuid);

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
  select r.subject_name, r.result, r.created_at
  from public.readings r
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
