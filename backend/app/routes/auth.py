from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import RedirectResponse

from app.config import settings
from app.services.supabase_service import supabase_service

router = APIRouter()


@router.get("/auth/github/login")
async def github_login():
    if not settings.GITHUB_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.",
        )

    params = urlencode({
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": settings.GITHUB_OAUTH_REDIRECT_URI,
        "scope": "read:user user:email",
        "allow_signup": "true",
    })
    return RedirectResponse(f"https://github.com/login/oauth/authorize?{params}")


@router.get("/auth/github/callback")
async def github_callback(code: str = Query(...)):
    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GitHub OAuth is not configured.",
        )

    async with httpx.AsyncClient(timeout=15) as client:
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.GITHUB_OAUTH_REDIRECT_URI,
            },
        )
        token_payload = token_response.json()
        access_token = token_payload.get("access_token")
        if not access_token:
            error = token_payload.get("error_description") or token_payload.get("error") or "GitHub authorization failed."
            return RedirectResponse(f"{settings.FRONTEND_URL}/auth/callback?{urlencode({'error': error})}")

        auth_headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        profile_response = await client.get("https://api.github.com/user", headers=auth_headers)
        profile_response.raise_for_status()
        profile = profile_response.json()

        email = profile.get("email")
        if not email:
            emails_response = await client.get("https://api.github.com/user/emails", headers=auth_headers)
            if emails_response.status_code == 200:
                emails = emails_response.json()
                primary = next((item for item in emails if item.get("primary") and item.get("verified")), None)
                email = primary.get("email") if primary else None

    username = profile.get("login")
    if not username:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="GitHub profile did not include a username.")

    email = email or f"{username}@users.noreply.github.com"
    user = await supabase_service.get_or_create_user(github_username=username, email=email)

    query = urlencode({
        "user_id": user["id"],
        "username": username,
        "email": email,
        "avatar_url": profile.get("avatar_url") or "",
    })
    return RedirectResponse(f"{settings.FRONTEND_URL}/auth/callback?{query}")