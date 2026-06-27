-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: properties
create table public.properties (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    category text not null,
    image text not null,
    tag text,
    tagColor text,
    typeBadge text not null,
    title text not null,
    location text not null,
    price text not null,
    pricePerM2 text,
    specs jsonb not null default '[]'::jsonb,
    extra text
);

-- Table: team
create table public.team (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    role text not null,
    image text not null,
    phone text not null,
    phone_link text not null
);

-- Allow public read access
alter table public.properties enable row level security;
alter table public.team enable row level security;

create policy "Public properties are viewable by everyone." on public.properties for select using (true);
create policy "Public team members are viewable by everyone." on public.team for select using (true);

-- Allow public insert/delete for script (only for development/testing, remove in production!)
create policy "Public can insert properties." on public.properties for insert with check (true);
create policy "Public can delete properties." on public.properties for delete using (true);
create policy "Public can insert team members." on public.team for insert with check (true);
create policy "Public can delete team members." on public.team for delete using (true);
