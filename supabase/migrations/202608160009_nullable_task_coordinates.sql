-- Drop NOT NULL constraint on tasks.latitude and tasks.longitude
-- so cases can be created without GPS coordinates.

alter table public.tasks
  alter column latitude  drop not null,
  alter column longitude drop not null;
