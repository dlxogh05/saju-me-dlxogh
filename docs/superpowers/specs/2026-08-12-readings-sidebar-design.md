# Readings + Sidebar Design

## Goal
Store each saju form submission and its matching Gemini result in Supabase, and show saved names in a sidebar. Clicking a name loads that result (option B).

## Table: `readings`
- `id` uuid PK default gen_random_uuid()
- `name` text not null
- `birth` date not null
- `birth_time` text (nullable / empty ok)
- `gender` text not null
- `calendar` text not null
- `result` text not null
- `created_at` timestamptz default now()

RLS enabled. Policies: anon SELECT + INSERT.

## App behavior
1. On successful Gemini reply → INSERT row with inputs + result.
2. On load → SELECT readings ordered by created_at desc.
3. Left sidebar lists names; click sets result panel to that row’s result.

## Out of scope
Auth, edit/delete, form autofill on click.
