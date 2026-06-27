from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# --- User Schemas ---
class UserCreate(BaseModel):
    github_username: str
    email: str

class UserResponse(BaseModel):
    id: str
    github_username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Preferences Schemas ---
class UserPreferencesCreate(BaseModel):
    user_id: str
    domains: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    experience_level: str  # 'Beginner-Friendly', 'Intermediate', 'Advanced'
    career_goal: Optional[str] = None

class UserPreferencesResponse(BaseModel):
    id: str
    user_id: str
    domains: List[str]
    languages: List[str]
    experience_level: str
    career_goal: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class PreferencesRequest(BaseModel):
    github_username: str
    email: str
    domains: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    experience_level: str
    career_goal: Optional[str] = None


# --- Saved Repository Schemas ---
class SavedRepositoryCreate(BaseModel):
    user_id: str
    repo_name: str
    repo_owner: str
    repo_url: str
    domain: str
    difficulty: str
    gitniche_score: int

class SavedRepositoryResponse(BaseModel):
    id: str
    user_id: str
    repo_name: str
    repo_owner: str
    repo_url: str
    domain: str
    difficulty: str
    gitniche_score: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Repository Search & Scoring Schemas ---
class RepoResult(BaseModel):
    name: str
    owner: str
    description: Optional[str] = None
    stars: int
    forks: int
    language: Optional[str] = None
    domain: str
    difficulty_level: str
    last_activity_date: str
    gitniche_score: int
    github_url: str
    codespaces_url: str
    gitpod_url: str
