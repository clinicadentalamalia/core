create index user_roles_assigned_by_idx
  on public.user_roles (assigned_by)
  where assigned_by is not null;

create index appointments_created_by_idx
  on public.appointments (created_by);
