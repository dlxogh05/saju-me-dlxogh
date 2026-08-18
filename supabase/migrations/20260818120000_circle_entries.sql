create table public.circle_entries (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  guest_user_id uuid references auth.users (id) on delete set null,
  name text not null,
  birth date not null,
  birth_time text not null,
  gender text not null check (gender in ('male', 'female')),
  calendar text not null check (calendar in ('양력', '음력')),
  relation text not null,
  score integer not null check (score >= 0 and score <= 100),
  epithet text not null,
  line text not null,
  love_title text not null,
  love_line text not null,
  wealth_title text not null,
  wealth_line text not null,
  created_at timestamptz not null default now(),
  unique (host_id, birth, birth_time, calendar)
);

create index circle_entries_host_id_idx on public.circle_entries (host_id);

alter table public.circle_entries enable row level security;

create policy circle_entries_select_authed
  on public.circle_entries
  for select
  to authenticated
  using (true);

revoke all on table public.circle_entries from anon, authenticated, public;

grant select (
  id,
  host_id,
  name,
  relation,
  score,
  epithet,
  line,
  love_title,
  love_line,
  wealth_title,
  wealth_line,
  created_at
) on public.circle_entries to authenticated;

create function public.get_circle_host(p_host_id uuid)
returns table (
  id uuid,
  name text,
  birth date,
  birth_time text,
  gender text,
  calendar text
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.name, p.birth, p.birth_time, p.gender, p.calendar
  from public.profiles p
  where p.id = p_host_id;
$$;

revoke all on function public.get_circle_host(uuid) from public;
grant execute on function public.get_circle_host(uuid) to anon, authenticated;

create function public.submit_circle_entry(
  p_host_id uuid,
  p_name text,
  p_birth date,
  p_birth_time text,
  p_gender text,
  p_calendar text,
  p_relation text,
  p_score integer,
  p_epithet text,
  p_line text,
  p_love_title text,
  p_love_line text,
  p_wealth_title text,
  p_wealth_line text
)
returns table (
  id uuid,
  name text,
  relation text,
  score integer,
  epithet text,
  line text,
  love_title text,
  love_line text,
  wealth_title text,
  wealth_line text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_score integer;
begin
  if not exists (select 1 from public.profiles p where p.id = p_host_id) then
    raise exception 'host_missing';
  end if;

  if exists (
    select 1
    from public.profiles p
    where p.id = p_host_id
      and p.birth = p_birth
      and coalesce(p.birth_time, '') = coalesce(p_birth_time, '')
      and p.calendar = p_calendar
  ) then
    raise exception 'own_chart';
  end if;

  v_score := greatest(0, least(100, coalesce(p_score, 0)));

  return query
  insert into public.circle_entries (
    host_id,
    guest_user_id,
    name,
    birth,
    birth_time,
    gender,
    calendar,
    relation,
    score,
    epithet,
    line,
    love_title,
    love_line,
    wealth_title,
    wealth_line
  )
  values (
    p_host_id,
    auth.uid(),
    p_name,
    p_birth,
    coalesce(p_birth_time, ''),
    p_gender,
    p_calendar,
    p_relation,
    v_score,
    p_epithet,
    p_line,
    p_love_title,
    p_love_line,
    p_wealth_title,
    p_wealth_line
  )
  on conflict (host_id, birth, birth_time, calendar)
  do update set
    name = excluded.name,
    gender = excluded.gender,
    guest_user_id = coalesce(excluded.guest_user_id, public.circle_entries.guest_user_id),
    relation = excluded.relation,
    score = excluded.score,
    epithet = excluded.epithet,
    line = excluded.line,
    love_title = excluded.love_title,
    love_line = excluded.love_line,
    wealth_title = excluded.wealth_title,
    wealth_line = excluded.wealth_line
  returning
    public.circle_entries.id,
    public.circle_entries.name,
    public.circle_entries.relation,
    public.circle_entries.score,
    public.circle_entries.epithet,
    public.circle_entries.line,
    public.circle_entries.love_title,
    public.circle_entries.love_line,
    public.circle_entries.wealth_title,
    public.circle_entries.wealth_line;
end;
$$;

revoke all on function public.submit_circle_entry(
  uuid, text, date, text, text, text, text, integer, text, text, text, text, text, text
) from public;
grant execute on function public.submit_circle_entry(
  uuid, text, date, text, text, text, text, integer, text, text, text, text, text, text
) to anon, authenticated;
