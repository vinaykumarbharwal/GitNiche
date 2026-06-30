import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_path))

from dotenv import load_dotenv
load_dotenv(backend_path / ".env")

from app.config import settings

def main():
    print("Initializing Supabase Client...")
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        print("Error: SUPABASE_URL or SUPABASE_KEY is missing from backend/.env configuration.")
        return

    try:
        from supabase import create_client
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        print("Successfully connected to Supabase.")
    except Exception as e:
        print(f"Error initializing Supabase client: {e}")
        return

    # Check users table
    print("\nChecking for database tables...")
    try:
        supabase.table("users").select("id").limit(1).execute()
        print("Success: 'users' table exists.")
    except Exception as e:
        err_msg = str(e)
        if "PGRST205" in err_msg or "schema cache" in err_msg or "does not exist" in err_msg:
            print("\nError: The Supabase database tables do not exist in the schema.")
            print("Please follow the instructions in the README to execute the contents of backend/schema.sql in your Supabase SQL Editor first.")
            return
        else:
            print(f"Error querying 'users' table: {e}")
            return

    # Seed data
    print("\nSeeding Database...")
    try:
        # 1. Insert/Get seed user
        github_username = "vinaykumarbharwal"
        email = "vinaykumarbharwal@gmail.com"
        
        # Check if user already exists
        user_res = supabase.table("users").select("*").eq("github_username", github_username).execute()
        if user_res.data:
            user = user_res.data[0]
            print(f"Seed user '{github_username}' already exists. User ID: {user['id']}")
        else:
            insert_res = supabase.table("users").insert({
                "github_username": github_username,
                "email": email
            }).execute()
            user = insert_res.data[0]
            print(f"Created seed user '{github_username}'. User ID: {user['id']}")

        user_id = user["id"]

        # 2. Insert/Update preferences
        pref_res = supabase.table("user_preferences").select("id").eq("user_id", user_id).execute()
        pref_data = {
            "user_id": user_id,
            "domains": ["AI/ML", "Web Development", "Cloud"],
            "languages": ["Python", "TypeScript", "JavaScript"],
            "experience_level": "Beginner-Friendly",
            "career_goal": "Contribute to open-source software and build developer workflows."
        }
        if pref_res.data:
            supabase.table("user_preferences").update(pref_data).eq("user_id", user_id).execute()
            print("Updated user preferences.")
        else:
            supabase.table("user_preferences").insert(pref_data).execute()
            print("Inserted user preferences.")

        # 3. Insert saved repositories
        # Check if any saved repo exists
        saved_res = supabase.table("saved_repositories").select("id").eq("user_id", user_id).execute()
        if saved_res.data:
            print("Saved repositories already seeded.")
        else:
            repos_to_save = [
                {
                    "user_id": user_id,
                    "repo_name": "public-apis",
                    "repo_owner": "public-apis",
                    "repo_url": "https://github.com/public-apis/public-apis",
                    "domain": "Web Development",
                    "difficulty": "Beginner-Friendly",
                    "gitniche_score": 91
                },
                {
                    "user_id": user_id,
                    "repo_name": "fastapi",
                    "repo_owner": "fastapi",
                    "repo_url": "https://github.com/fastapi/fastapi",
                    "domain": "Web Development",
                    "difficulty": "Intermediate",
                    "gitniche_score": 86
                },
                {
                    "user_id": user_id,
                    "repo_name": "scikit-learn",
                    "repo_owner": "scikit-learn",
                    "repo_url": "https://github.com/scikit-learn/scikit-learn",
                    "domain": "AI/ML",
                    "difficulty": "Beginner-Friendly",
                    "gitniche_score": 87
                }
            ]
            supabase.table("saved_repositories").insert(repos_to_save).execute()
            print("Successfully seeded saved repositories.")

        print("\nDatabase seeding completed successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")

if __name__ == "__main__":
    main()
