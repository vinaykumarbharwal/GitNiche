from urllib.parse import urlencode
import secrets
import httpx
from fastapi import APIRouter, HTTPException, Query, status, Request
from fastapi.responses import RedirectResponse

from app.config import settings
from app.services.supabase_service import supabase_service

router = APIRouter()


@router.get("/auth/github/login")
async def github_login():
    if not settings.GITHUB_CLIENT_ID:
        message = "GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in backend/.env."
        return RedirectResponse(f"{settings.FRONTEND_URL}/auth/callback?{urlencode({'error': message})}")

    state = secrets.token_urlsafe(16)
    params = urlencode({
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": settings.GITHUB_OAUTH_REDIRECT_URI,
        "scope": "read:user user:email",
        "allow_signup": "true",
        "state": state
    })
    response = RedirectResponse(f"https://github.com/login/oauth/authorize?{params}")
    response.set_cookie(
        key="github_oauth_state",
        value=state,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="lax",
        max_age=600  # 10 minutes
    )
    return response


@router.get("/auth/github/callback")
async def github_callback(
    request: Request,
    code: str | None = Query(default=None),
    state: str | None = Query(default=None),
    error: str | None = Query(default=None),
    error_description: str | None = Query(default=None),
):
    cookie_state = request.cookies.get("github_oauth_state")
    if not cookie_state or cookie_state != state:
        return RedirectResponse(
            f"{settings.FRONTEND_URL}/auth/callback?{urlencode({'error': 'CSRF state verification failed.'})}"
        )
    if error:
        message = error_description or error
        return RedirectResponse(f"{settings.FRONTEND_URL}/auth/callback?{urlencode({'error': message})}")

    if not code:
        return RedirectResponse(
            f"{settings.FRONTEND_URL}/auth/callback?{urlencode({'error': 'Missing GitHub authorization code.'})}"
        )

    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        return RedirectResponse(
            f"{settings.FRONTEND_URL}/auth/callback?{urlencode({'error': 'GitHub OAuth is not configured on the backend.'})}"
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