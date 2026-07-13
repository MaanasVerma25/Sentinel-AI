-- Create mentions table
create table if not exists public.mentions (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  source text not null check (source in ('reddit', 'news')),
  author text not null,
  title text not null,
  text text not null,
  url text not null,
  subreddit text,
  score integer,
  text_hash text not null,
  created_at timestamptz not null,
  ingested_at timestamptz default now() not null,
  sentiment text check (sentiment in ('positive', 'negative', 'neutral', 'critical')),
  category text,
  urgency text,
  summary text,
  
  -- Deduplication unique constraint per company
  constraint unique_company_text_hash unique (company_id, text_hash)
);

-- Enable Row Level Security (RLS)
alter table public.mentions enable row level security;

-- Create RLS policies for mentions (allow read and insert)
create policy "Allow public read access to mentions"
  on public.mentions for select
  using (true);

create policy "Allow public insert access to mentions"
  on public.mentions for insert
  with check (true);
