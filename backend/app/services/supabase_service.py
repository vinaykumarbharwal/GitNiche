import uuid
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.config import settings

logger = logging.getLogger("gitniche.supabase")

# Initialize client if keys are provided
supabase_client = None
if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    try:
        from supabase import create_client
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        logger.info("Supabase client initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {str(e)}")

class SupabaseService:
    def __init__(self):
        self.client = supabase_client
        self.enabled = supabase_client is not None
        
        # Local mock storage for development fallback
        self._mock_users: Dict[str, Dict[str, Any]] = {}
        self._mock_preferences: Dict[str, Dict[str, Any]] = {}
        self._mock_saved_repos: List[Dict[str, Any]] = []
        self._mock_search_history: List[Dict[str, Any]] = []

        # Create a default mock user for quick local testing
        default_uid = "00000000-0000-0000-0000-000000000000"
        self._mock_users[default_uid] = {
            "id": default_uid,
            "github_username": "mockdev",
            "email": "mockdev@example.com",
            "created_at": datetime.utcnow()
        }
        self._mock_preferences[default_uid] = {
            "id": str(uuid.uuid4()),
            "user_id": default_uid,
            "domains": ["AI/ML", "Web Development"],
            "languages": ["TypeScript", "Python"],
            "experience_level": "Beginner-Friendly",
            "career_goal": "Contribute to open-source and learn web dev.",
            "created_at": datetime.utcnow()
        }

    def _handle_db_error(self, method_name: str, exception: Exception):
        err_msg = str(exception)
        if "PGRST205" in err_msg or "schema cache" in err_msg or "PGRST204" in err_msg:
            logger.warning(
                f"Supabase database schema is missing tables. Disabling Supabase client for this session and "
                f"falling back to local memory. Error details: {err_msg}"
            )
            self.enabled = False
        else:
            logger.warning(f"Supabase database error in {method_name}: {err_msg}. Falling back to memory.")

    async def get_or_create_user(self, github_username: str, email: str) -> Dict[str, Any]:
        if not self.enabled:
            # Check mock users
            for uid, user in self._mock_users.items():
                if user["github_username"] == github_username:
                    return user
            
            # Create a new mock user
            uid = str(uuid.uuid4())
            new_user = {
                "id": uid,
                "github_username": github_username,
                "email": email,
                "created_at": datetime.utcnow()
            }
            self._mock_users[uid] = new_user
            return new_user

        try:
            # Try to get user
            response = self.client.table("users").select("*").eq("github_username", github_username).execute()
            if response.data:
                return response.data[0]
            
            # Create user
            insert_resp = self.client.table("users").insert({
                "github_username": github_username,
                "email": email
            }).execute()
            if insert_resp.data:
                return insert_resp.data[0]
        except Exception as e:
            self._handle_db_error("get_or_create_user", e)
            
        # Fallback to creating a local user on error
        uid = str(uuid.uuid4())
        return {"id": uid, "github_username": github_username, "email": email, "created_at": datetime.utcnow()}

    async def save_preferences(
        self,
        user_id: str,
        domains: List[str],
        languages: List[str],
        experience_level: str,
        career_goal: Optional[str]
    ) -> Dict[str, Any]:
        pref_data = {
            "user_id": user_id,
            "domains": domains,
            "languages": languages,
            "experience_level": experience_level,
            "career_goal": career_goal
        }

        if not self.enabled:
            self._mock_preferences[user_id] = {
                "id": self._mock_preferences.get(user_id, {}).get("id") or str(uuid.uuid4()),
                "user_id": user_id,
                "domains": domains,
                "languages": languages,
                "experience_level": experience_level,
                "career_goal": career_goal,
                "created_at": datetime.utcnow()
            }
            return self._mock_preferences[user_id]

        try:
            # We can upsert by checking if user_preferences has an entry for user_id
            check_resp = self.client.table("user_preferences").select("id").eq("user_id", user_id).execute()
            if check_resp.data:
                pref_id = check_resp.data[0]["id"]
                resp = self.client.table("user_preferences").update(pref_data).eq("id", pref_id).execute()
            else:
                resp = self.client.table("user_preferences").insert(pref_data).execute()
            
            if resp.data:
                return resp.data[0]
        except Exception as e:
            self._handle_db_error("save_preferences", e)

        # Fallback to local memory on error
        self._mock_preferences[user_id] = {**pref_data, "id": str(uuid.uuid4()), "created_at": datetime.utcnow()}
        return self._mock_preferences[user_id]

    async def get_preferences(self, user_id: str) -> Optional[Dict[str, Any]]:
        if not self.enabled:
            return self._mock_preferences.get(user_id)

        try:
            resp = self.client.table("user_preferences").select("*").eq("user_id", user_id).execute()
            if resp.data:
                return resp.data[0]
        except Exception as e:
            self._handle_db_error("get_preferences", e)

        return self._mock_preferences.get(user_id)

    async def save_repository(
        self,
        user_id: str,
        repo_name: str,
        repo_owner: str,
        repo_url: str,
        domain: str,
        difficulty: str,
        gitniche_score: int
    ) -> Dict[str, Any]:
        repo_data = {
            "user_id": user_id,
            "repo_name": repo_name,
            "repo_owner": repo_owner,
            "repo_url": repo_url,
            "domain": domain,
            "difficulty": difficulty,
            "gitniche_score": gitniche_score
        }

        if not self.enabled:
            # Avoid duplicating mock saved repo
            for r in self._mock_saved_repos:
                if r["user_id"] == user_id and r["repo_name"] == repo_name and r["repo_owner"] == repo_owner:
                    return r
            
            new_repo = {**repo_data, "id": str(uuid.uuid4()), "created_at": datetime.utcnow()}
            self._mock_saved_repos.append(new_repo)
            return new_repo

        try:
            # Check duplicate to prevent pkey error
            dup_resp = self.client.table("saved_repositories").select("*")\
                .eq("user_id", user_id)\
                .eq("repo_owner", repo_owner)\
                .eq("repo_name", repo_name).execute()
            if dup_resp.data:
                return dup_resp.data[0]

            resp = self.client.table("saved_repositories").insert(repo_data).execute()
            if resp.data:
                return resp.data[0]
        except Exception as e:
            self._handle_db_error("save_repository", e)

        # Fallback to local memory on error
        new_repo = {**repo_data, "id": str(uuid.uuid4()), "created_at": datetime.utcnow()}
        self._mock_saved_repos.append(new_repo)
        return new_repo

    async def get_saved_repositories(self, user_id: str) -> List[Dict[str, Any]]:
        if not self.enabled:
            return [r for r in self._mock_saved_repos if r["user_id"] == user_id]

        try:
            resp = self.client.table("saved_repositories").select("*").eq("user_id", user_id).execute()
            if resp.data:
                return resp.data
        except Exception as e:
            self._handle_db_error("get_saved_repositories", e)

        return [r for r in self._mock_saved_repos if r["user_id"] == user_id]

    async def unsave_repository(self, user_id: str, repo_owner: str, repo_name: str) -> bool:
        if not self.enabled:
            before_len = len(self._mock_saved_repos)
            self._mock_saved_repos = [
                r for r in self._mock_saved_repos
                if not (r["user_id"] == user_id and r["repo_owner"] == repo_owner and r["repo_name"] == repo_name)
            ]
            return len(self._mock_saved_repos) < before_len

        try:
            check_resp = self.client.table("saved_repositories").select("id")\
                .eq("user_id", user_id)\
                .eq("repo_owner", repo_owner)\
                .eq("repo_name", repo_name).execute()
            if not check_resp.data:
                # Try fallback list before giving up
                before_len = len(self._mock_saved_repos)
                self._mock_saved_repos = [
                    r for r in self._mock_saved_repos
                    if not (r["user_id"] == user_id and r["repo_owner"] == repo_owner and r["repo_name"] == repo_name)
                ]
                return len(self._mock_saved_repos) < before_len

            self.client.table("saved_repositories").delete()\
                .eq("user_id", user_id)\
                .eq("repo_owner", repo_owner)\
                .eq("repo_name", repo_name).execute()
            return True
        except Exception as e:
            self._handle_db_error("unsave_repository", e)

        # Try fallback on exception
        before_len = len(self._mock_saved_repos)
        self._mock_saved_repos = [
            r for r in self._mock_saved_repos
            if not (r["user_id"] == user_id and r["repo_owner"] == repo_owner and r["repo_name"] == repo_name)
        ]
        return len(self._mock_saved_repos) < before_len

    async def save_search_history(self, user_id: str, query: str, filters: Dict[str, Any]) -> None:
        search_data = {
            "user_id": user_id,
            "query": query,
            "filters": filters
        }

        if not self.enabled:
            self._mock_search_history.append({**search_data, "id": str(uuid.uuid4()), "created_at": datetime.utcnow()})
            return

        try:
            self.client.table("search_history").insert(search_data).execute()
        except Exception as e:
            self._handle_db_error("save_search_history", e)

    async def clear_saved_repositories(self, user_id: str) -> bool:
        self._mock_saved_repos = [r for r in self._mock_saved_repos if r["user_id"] != user_id]
        if not self.enabled:
            return True
        try:
            self.client.table("saved_repositories").delete().eq("user_id", user_id).execute()
            return True
        except Exception as e:
            self._handle_db_error("clear_saved_repositories", e)
            return True

    async def delete_user_data(self, user_id: str) -> bool:
        if user_id in self._mock_users:
            del self._mock_users[user_id]
        if user_id in self._mock_preferences:
            del self._mock_preferences[user_id]
        self._mock_saved_repos = [r for r in self._mock_saved_repos if r["user_id"] != user_id]
        self._mock_search_history = [s for s in self._mock_search_history if s["user_id"] != user_id]

        if not self.enabled:
            return True
        try:
            self.client.table("users").delete().eq("id", user_id).execute()
            return True
        except Exception as e:
            self._handle_db_error("delete_user_data", e)
            return True

supabase_service = SupabaseService()
