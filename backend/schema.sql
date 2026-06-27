-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table
create table if not exists users (
    id uuid default gen_random_uuid() primary key,
    github_username text unique not null,
    email text unique not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. User Preferences Table
create table if not exists user_preferences (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references users(id) on delete cascade not null,
    domains text[] not null default '{}',
    languages text[] not null default '{}',
    experience_level text not null check (experience_level in ('Beginner-Friendly', 'Intermediate', 'Advanced')),
    career_goal text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Saved Repositories Table
create table if not exists saved_repositories (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references users(id) on delete cascade not null,
    repo_name text not null,
    repo_owner text not null,
    repo_url text not null,
    domain text not null,
    difficulty text not null,
    gitniche_score integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, repo_owner, repo_name)
);

-- 4. Search History Table
create table if not exists search_history (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references users(id) on delete cascade not null,
    query text not null,
    filters jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
