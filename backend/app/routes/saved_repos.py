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
    return saved_repos

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
