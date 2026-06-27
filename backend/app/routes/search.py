from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from app.schemas import RepoResult
from app.services.github_service import github_service
from app.services.supabase_service import supabase_service

router = APIRouter()

@router.get("/search", response_model=List[RepoResult])
async def search_repositories(
    query: Optional[str] = Query(None),
    domain: Optional[str] = Query(None),
    experience_level: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None)
):
    # 1. Fetch user preferred languages if user_id is provided
    preferred_languages = []
    if user_id:
        pref = await supabase_service.get_preferences(user_id)
        if pref:
            preferred_languages = pref.get("languages", [])

    # 2. Perform search
    results = await github_service.search_repositories(
        query=query or "",
        domain=domain,
        experience_level=experience_level,
        language=language,
        user_preferred_languages=preferred_languages
    )

    # 3. Log query to search history in background (if user_id is provided)
    if user_id:
        filters = {
            "domain": domain,
            "experience_level": experience_level,
            "language": language
        }
        await supabase_service.save_search_history(
            user_id=user_id,
            query=query or "",
            filters=filters
        )

    return results
