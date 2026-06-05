alter table public.products
  add column if not exists source_platform text,
  add column if not exists source_id text,
  add column if not exists source_price numeric(10, 2),
  add column if not exists source_currency text,
  add column if not exists detail_image_urls text[] not null default '{}',
  add column if not exists source_payload jsonb not null default '{}'::jsonb;

update public.products
set source_platform = coalesce(source_platform, platform),
    source_id = coalesce(source_id, id::text)
where source_platform is null or source_id is null;

create unique index if not exists products_source_unique_idx
on public.products (source_platform, source_id)
where source_platform is not null and source_id is not null;

create index if not exists products_source_platform_idx
on public.products using btree (source_platform);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;
