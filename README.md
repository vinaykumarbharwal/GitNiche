# GitNiche | Find Open Source Projects for Your Skills

GitNiche is a smart discovery dashboard that helps developers find active, beginner-friendly, and high-value open-source contribution opportunities. 

Rather than scrolling through thousands of repositories on GitHub trying to find one with good documentation and accessible issues, GitNiche categorizes, scores, and filters projects matching your exact developer stack.

---

## 🌟 Why GitNiche? (The Plain English Version)

Finding a repository to contribute to can be intimidating. Many repositories are inactive, have complex codebases without setup guides, or lack beginner-friendly issues. 

**GitNiche solves this by automatically analyzing projects and providing:**
*   **The GitNiche Score (out of 100)**: A popularity, activity, documentation, and ease-of-entry score showing how welcoming a repository is for new contributors.
*   **Contribution Categorization**: Automatically groups repositories into domains like **AI/ML, Web Development, DevOps, Cloud, Cybersecurity, and Blockchain**.
*   **Clear Difficulty Badges**: Labels projects as *Beginner-Friendly*, *Intermediate*, or *Advanced* based on issue tags, codebase density, and user-preferred levels.
*   **One-Click Workspaces**: Click a button to instantly open a project in **GitHub Codespaces** or **Gitpod** with pre-configured cloud coding environments.

---

## 🔍 How It Works

1.  **Search & Filter**: Type tags like `Python`, `React`, `AI`, or `DevOps` in the search bar, or narrow down projects using the domain and difficulty dropdowns.
2.  **Inspect Metrics**: Every repository card lists stars (popularity), open issues (work to do), good first issues (beginner tasks), licensing information, and relative activity times (e.g., *updated 2 days ago*).
3.  **Customize Preferences**: Sign in with GitHub to set your default programming languages and interest domains.
4.  **Save Your Bookmarks**: Bookmark promising repositories to review later.

---

## 💼 Information for Recruiters & Reviewers

If you are reviewing this project, you can test all features without installing anything locally:
*   **Secure GitHub Login**: We request read-only profile scopes. We do not access, write, or delete your source code or repositories.
*   **Developer Preferences**: Modify filters and save them. They persist across sessions.
*   **Data Control (Danger Zone)**: In your profile settings, you have access to a "Danger Zone" where you can clear your bookmarks or permanently delete all your account profile records from our databases.
*   **Accessibility & SEO**: Fully compatible with screen readers (using HTML standard aria labels and status announcements) and optimized for search engine crawl indices.

---

## 🛠️ Technical Overview & Architecture

GitNiche is built using a decoupled client-server architecture:
*   **Frontend**: Next.js (App Router), styled using theme-aware design variables (Dark Mode support).
*   **Backend**: FastAPI (Python), serving search endpoints, OAuth callbacks, and data synchronizations.
*   **Database**: Supabase (PostgreSQL), managing user preferences, bookmarks, and histories.
*   **Caching**: Upstash Redis REST API (with local in-memory TTL fallbacks) to prevent GitHub rate-limiting.

<details>
<summary>📂 Project Directory Layout</summary>

```text
GitNiche/
├── backend/
│   ├── app/
│   │   ├── routes/          # Endpoint Handlers (Auth, Search, Preferences, Saved)
│   │   ├── services/        # Scoring, AI Classifiers, GitHub API, Supabase & Redis clients
│   │   ├── config.py        # Settings loader
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── main.py          # FastAPI server entrypoint
│   ├── requirements.txt     # Python package requirements
│   ├── schema.sql           # Database schema definition
│   └── .env.example         # Template for environment settings
└── frontend/
    ├── src/
    │   ├── app/             # Page layouts and routers (Explore, Saved, Profile, Privacy)
    │   ├── components/      # Reusable UI components (Navbar, Filters, RepoCard)
    │   └── services/        # Frontend API call service
    ├── package.json         # Node.js configurations
    └── .env.example         # Template for client configurations
```
</details>

<details>
<summary>🔑 Database Table Definitions (SQL)</summary>

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
</details>

---

## 🚀 Local Installation Guide

### 1. Backend Setup (FastAPI)
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Set up a Python virtual environment and activate it:
    ```bash
    python -m venv venv
    # Windows:
    .\venv\Scripts\activate
    # macOS/Linux:
    source venv/bin/activate
    ```
3.  Install requirements:
    ```bash
    pip install -r requirements.txt
    ```
4.  Copy `.env.example` to `.env` and fill in credentials:
    ```bash
    cp .env.example .env
    ```
5.  Start the FastAPI server:
    ```bash
    python app/main.py
    ```
    *API documentation will be available at `http://127.0.0.1:8000/docs`.*

### 2. Frontend Setup (Next.js)
1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Next.js development server:
    ```bash
    npm run dev
    ```
    *Open `http://localhost:3000` in your browser to view the application.*
