-- Add Extensions
create extension if not exists "uuid-ossp";

-- Update profiles table with financial information
alter table if exists public.profiles 
add column if not exists monthly_income decimal(12,2),
add column if not exists currency text default 'USD';

-- Create or update transactions table
create table if not exists public.transactions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    amount decimal(12,2) not null,
    category text not null,
    description text,
    date timestamp with time zone default timezone('utc'::text, now()) not null,
    type text not null check (type in ('income', 'expense')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create or update budgets table
create table if not exists public.budgets (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    category text not null,
    amount decimal(12,2) not null,
    current_amount decimal(12,2) default 0,
    period text not null check (period in ('monthly', 'yearly')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create or update savings goals table
create table if not exists public.savings_goals (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    name text not null,
    target_amount decimal(12,2) not null,
    current_amount decimal(12,2) default 0,
    target_date timestamp with time zone,
    status text default 'in_progress' check (status in ('in_progress', 'completed', 'cancelled')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create or update notifications table
create table if not exists public.notifications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    title text not null,
    message text not null,
    type text not null check (type in ('bill_due', 'budget_exceeded', 'goal_reached', 'system')),
    read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on new tables
alter table if exists public.transactions enable row level security;
alter table if exists public.budgets enable row level security;
alter table if exists public.savings_goals enable row level security;
alter table if exists public.notifications enable row level security;

-- Create policies for transactions
create policy if not exists "Users can view their own transactions"
    on public.transactions for select
    using (auth.uid() = user_id);

create policy if not exists "Users can insert their own transactions"
    on public.transactions for insert
    with check (auth.uid() = user_id);

create policy if not exists "Users can update their own transactions"
    on public.transactions for update
    using (auth.uid() = user_id);

create policy if not exists "Users can delete their own transactions"
    on public.transactions for delete
    using (auth.uid() = user_id);

-- Create policies for budgets
create policy if not exists "Users can view their own budgets"
    on public.budgets for select
    using (auth.uid() = user_id);

create policy if not exists "Users can manage their own budgets"
    on public.budgets for all
    using (auth.uid() = user_id);

-- Create policies for savings goals
create policy if not exists "Users can view their own savings goals"
    on public.savings_goals for select
    using (auth.uid() = user_id);

create policy if not exists "Users can manage their own savings goals"
    on public.savings_goals for all
    using (auth.uid() = user_id);

-- Create policies for notifications
create policy if not exists "Users can view their own notifications"
    on public.notifications for select
    using (auth.uid() = user_id);

create policy if not exists "Users can update their own notifications"
    on public.notifications for update
    using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists transactions_date_idx on public.transactions(date);
create index if not exists budgets_user_id_idx on public.budgets(user_id);
create index if not exists savings_goals_user_id_idx on public.savings_goals(user_id);
create index if not exists notifications_user_id_idx on public.notifications(user_id);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger if not exists handle_updated_at
    before update on public.transactions
    for each row
    execute procedure public.handle_updated_at();

create trigger if not exists handle_updated_at
    before update on public.budgets
    for each row
    execute procedure public.handle_updated_at();

create trigger if not exists handle_updated_at
    before update on public.savings_goals
    for each row
    execute procedure public.handle_updated_at();
