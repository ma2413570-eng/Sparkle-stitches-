-- Sparkle Stitches final schema patch
-- The product columns below have already been applied to the connected Supabase project.
-- Keep this file for reference/redeployment.

alter table public.products
  add column if not exists production_time text,
  add column if not exists image_url_2 text,
  add column if not exists image_url_3 text,
  add column if not exists image_url_4 text;

-- admin_users currently stores email + created_at.
drop policy if exists "Admins add admin users" on public.admin_users;
create policy "Admins add admin users" on public.admin_users
for insert to authenticated with check (is_admin());

drop policy if exists "Admins remove admin users" on public.admin_users;
create policy "Admins remove admin users" on public.admin_users
for delete to authenticated using (is_admin());

-- login_activity, notifications and custom_orders already exist in this project.
-- Their existing triggers create customer/admin notifications for order and custom-order events.
