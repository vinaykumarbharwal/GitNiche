from fastapi import APIRouter, HTTPException, Query, status
from typing import List
from app.schemas import SavedRepositoryCreate, SavedRepositoryResponse
from app.services.supabase_service import supabase_service

router = APIRouter()

@router.post("/saved-repos", response_model=SavedRepositoryResponse)
async def save_repository(payload: SavedRepositoryCreate):
    saved_repo = await supabase_service.save_repository(
        user_id=payload.user_id,
        repo_name=payload.repo_name,
        repo_owner=payload.repo_owner,
        repo_url=payload.repo_url,
        domain=payload.domain,
        difficulty=payload.difficulty,
        gitniche_score=payload.gitniche_score
    )
    return saved_repo

@router.get("/saved-repos/{user_id}", response_model=List[SavedRepositoryResponse])
async def get_saved_repositories(user_id: str):
    saved_repos = await supabase_service.get_saved_repositories(user_id)
    
    import httpx
    import asyncio
    from app.services.github_service import github_service

    async def enrich_repo(repo_dict):
        repo = dict(repo_dict) if not hasattr(repo_dict, "__dict__") else repo_dict.__dict__
        owner = repo.get("repo_owner")
        name = repo.get("repo_name")
        
        repo["description"] = "Bookmarked opportunity."
        repo["stars"] = 0
        repo["forks"] = 0
        repo["language"] = None
        
        try:
            async with httpx.AsyncClient() as client:
                url = f"https://api.github.com/repos/{owner}/{name}"
                headers = github_service.headers
                response = await client.get(url, headers=headers, timeout=3.0)
                if response.status_code == 200:
                    data = response.json()
                    repo["description"] = data.get("description") or ""
                    repo["stars"] = data.get("stargazers_count", 0)
                    repo["forks"] = data.get("forks_count", 0)
                    repo["language"] = data.get("language")
        except Exception:
            pass
        return repo

    tasks = [enrich_repo(r) for r in saved_repos]
    enriched = await asyncio.gather(*tasks)
    return enriched

@router.delete("/saved-repos")
async def unsave_repository(
    user_id: str = Query(..., min_length=1),
    repo_owner: str = Query(..., min_length=1),
    repo_name: str = Query(..., min_length=1),
):
    removed = await supabase_service.unsave_repository(
        user_id=user_id,
        repo_owner=repo_owner,
        repo_name=repo_name,
    )
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved repository not found."
        )
    return {"message": "Repository removed from saved list."}

@router.delete("/saved-repos/clear/{user_id}")
async def clear_all_saved_repositories(user_id: str):
    success = await supabase_service.clear_saved_repositories(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear saved repositories."
        )
    return {"message": "All saved repositories cleared."}
