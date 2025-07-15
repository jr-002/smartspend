-- Create users profile table
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade,
    username text unique,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (id)
);

-- Create transactions table
create table if not exists public.transactions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    amount decimal(12,2) not null,
    category text not null,
    description text,
    date timestamp with time zone default timezone('utc'::text, now()) not null,
    type text not null check (type in ('income', 'expense')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create budgets table
create table if not exists public.budgets (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    category text not null,
    amount decimal(12,2) not null,
    period text not null check (period in ('monthly', 'yearly')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create savings_goals table
create table if not exists public.savings_goals (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    name text not null,
    target_amount decimal(12,2) not null,
    current_amount decimal(12,2) default 0,
    target_date timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create bills table
create table if not exists public.bills (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    name text not null,
    amount decimal(12,2) not null,
    due_date timestamp with time zone not null,
    recurring boolean default false,
    frequency text check (frequency in ('monthly', 'yearly', 'weekly', null)),
    paid boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create debts table
create table if not exists public.debts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    name text not null,
    total_amount decimal(12,2) not null,
    remaining_amount decimal(12,2) not null,
    interest_rate decimal(5,2),
    minimum_payment decimal(12,2),
    due_date timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create investments table
create table if not exists public.investments (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    name text not null,
    type text not null,
    amount_invested decimal(12,2) not null,
    current_value decimal(12,2),
    purchase_date timestamp with time zone not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;
alter table public.bills enable row level security;
alter table public.debts enable row level security;
alter table public.investments enable row level security;

-- Create security policies
create policy "Users can view their own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- Transactions policies
create policy "Users can view their own transactions"
    on public.transactions for select
    using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
    on public.transactions for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
    on public.transactions for update
    using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
    on public.transactions for delete
    using (auth.uid() = user_id);

-- Similar policies for other tables
create policy "Users can perform all operations on their budgets"
    on public.budgets for all
    using (auth.uid() = user_id);

create policy "Users can perform all operations on their savings goals"
    on public.savings_goals for all
    using (auth.uid() = user_id);

create policy "Users can perform all operations on their bills"
    on public.bills for all
    using (auth.uid() = user_id);

create policy "Users can perform all operations on their debts"
    on public.debts for all
    using (auth.uid() = user_id);

create policy "Users can perform all operations on their investments"
    on public.investments for all
    using (auth.uid() = user_id);

-- Create functions for automatic updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_updated_at
    before update on public.profiles
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.budgets
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.savings_goals
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.bills
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.debts
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.investments
    for each row
    execute procedure public.handle_updated_at();
