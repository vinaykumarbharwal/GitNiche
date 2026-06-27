# GitNiche: AI-Powered GitHub Discovery Platform

GitNiche is an AI-powered GitHub discovery platform designed to help developers find active, beginner-friendly, and high-value open-source contribution opportunities matching their technology stack, experience level, and career objectives.

---

## Key Features

1. **Intelligent Opportunity Discovery**: Search GitHub repositories, issues, and pull requests.
2. **Domain Classification**: Categorize opportunities into AI/ML, Blockchain, Cybersecurity, Web Development, DevOps, and Cloud (using rule-based matching with zero-shot NLP fallback using Hugging Face's Inference API).
3. **Activity Enforcement**: Checks repository activity within the last 7 days.
4. **GitNiche Score (out of 100)**: Calculates popularity, beginner-friendliness, activity, responsiveness, and documentation quality.
5. **Local Caching**: Integrates with Upstash Redis cache (REST API) to bypass GitHub's API rate limiting.
6. **Developer Profile Settings**: Save user preferences, bookmarked repositories, and queries history directly to Supabase.
7. **One-Click Workspace Launch**: Launch contribution environments in one click via GitHub Codespaces or Gitpod.

---

## Directory Layout

```text
GitNiche/
├── backend/
│   ├── app/
│   │   ├── routes/          # API Endpoint Handlers
│   │   ├── services/        # Scoring, Classifier, GitHub API, Supabase & Redis clients
│   │   ├── config.py        # Settings loader
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── main.py          # FastAPI startup file
│   ├── requirements.txt     # Python package requirements
│   ├── schema.sql           # Database structure query for Supabase
│   └── .env.example         # Template for python settings
└── frontend/
    ├── src/
    │   ├── app/             # Page layouts and routers (Explore, Saved, Preferences)
    │   ├── components/      # UI components (Navbar, Filters, Cards, Forms)
    │   └── services/        # Client-side API caller
    ├── tailwind.config.ts   # Style definitions
    ├── package.json         # Node.js configurations
    └── .env.example         # Template for React configs
```

---

## Database Tables (Supabase SQL)

Ensure these tables are provisioned in your Supabase SQL editor:

```sql
create table if not exists users (
    id uuid default gen_random_uuid() primary key,
    github_username text unique not null,
    email text unique not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists user_preferences (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references users(id) on delete cascade not null,
    domains text[] not null default '{}',
    languages text[] not null default '{}',
    experience_level text not null check (experience_level in ('Beginner-Friendly', 'Intermediate', 'Advanced')),
    career_goal text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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

create table if not exists search_history (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references users(id) on delete cascade not null,
    query text not null,
    filters jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

---

## Local Setup & Quick Start

### 1. Backend Service (FastAPI)

1. Move into the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and install packages:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate

   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and fill in credentials (optional; falls back to offline/mock models if left empty):
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   python app/main.py
   # or
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

*The API documentation is accessible at `http://127.0.0.1:8000/docs`.*

---

### 2. Frontend Interface (Next.js)

1. Move into the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

*Open `http://localhost:3000` in your web browser to explore GitNiche.*
