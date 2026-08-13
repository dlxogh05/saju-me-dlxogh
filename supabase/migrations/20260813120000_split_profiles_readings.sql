create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  birth date not null,
  birth_time text not null,
  gender text not null check (gender in ('male', 'female')),
  calendar text not null check (calendar in ('양력', '음력')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy profiles_select_own
  on public.profiles
  for select
  using (id = (select auth.uid()));

create policy profiles_insert_own
  on public.profiles
  for insert
  with check (id = (select auth.uid()));

create policy profiles_update_own
  on public.profiles
  for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

insert into public.profiles (id, name, birth, birth_time, gender, calendar, created_at)
select distinct on (user_id)
  user_id,
  name,
  birth,
  birth_time,
  gender,
  calendar,
  created_at
from public.readings
where user_id is not null
order by user_id, created_at desc;

delete from public.readings
where user_id is null;

alter table public.readings
  drop constraint readings_user_id_fkey;

drop policy if exists readings_update_own on public.readings;

alter table public.readings
  drop column name,
  drop column birth,
  drop column birth_time,
  drop column gender,
  drop column calendar,
  alter column user_id set not null,
  add constraint readings_user_id_fkey
    foreign key (user_id) references public.profiles (id) on delete cascade;

create index readings_user_id_idx on public.readings (user_id);
