alter table public.readings
  add column kind text not null default 'basic';

alter table public.readings
  add constraint readings_kind_check
    check (kind in ('basic', 'wealth', 'love'));
