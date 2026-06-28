from fastapi import APIRouter, HTTPException, Query, status
from app.schemas import PreferencesRequest, UserPreferencesResponse
from app.services.github_service import github_service
from app.services.supabase_service import supabase_service

router = APIRouter()

@router.get("/preferences/validate-github")
async def validate_github_identity(
    username: str = Query(..., min_length=1),
    email: str = Query(..., min_length=3),
):
    return await github_service.validate_user_identity(username=username, email=email)

@router.post("/preferences")
async def save_user_preferences(payload: PreferencesRequest):
    # 1. Get or create the user first
    user = await supabase_service.get_or_create_user(
        github_username=payload.github_username,
        email=payload.email
    )
    
    user_id = user["id"]
    
    # 2. Save preferences for this user
    pref = await supabase_service.save_preferences(
        user_id=user_id,
        domains=payload.domains,
        languages=payload.languages,
        experience_level=payload.experience_level,
        career_goal=payload.career_goal
    )
    
    return {
        "message": "Preferences saved successfully",
        "user": user,
        "preferences": pref
    }

@router.get("/preferences/{user_id}", response_model=UserPreferencesResponse)
async def get_user_preferences(user_id: str):
    pref = await supabase_service.get_preferences(user_id)
    if not pref:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Preferences for user {user_id} not found."
        )
    return pref
