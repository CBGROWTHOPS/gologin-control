"""GoLogin Control Center API. Proxies to GoLogin API using local token."""

import sys
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from gologin import (
    add_mobile_proxy,
    create_quick_profile,
    delete_profiles,
    get_profile,
    get_proxy_traffic,
    get_token,
    list_profiles,
    rename_profile,
)
from version import __version__


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        get_token()
    except Exception:
        print("ERROR: GoLogin token not found.")
        sys.exit(1)
    print("GoLogin Control Backend running on :8000")
    yield


app = FastAPI(title="GoLogin Control Center", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _get_token():
    try:
        return get_token()
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.get("/health")
@app.get("/api/health")
async def health():
    """No auth. Returns 200 if the proxy process is running."""
    return {"status": "ok", "version": __version__}


@app.get("/api/version")
async def version():
    """Backend version for UI display."""
    return {"version": __version__}


def _handle_http(err: httpx.HTTPStatusError):
    if err.response.status_code == 401:
        raise HTTPException(
            status_code=401,
            detail="GoLogin token expired. Get a fresh token from https://app.gologin.com → Settings → API",
        )
    raise HTTPException(
        status_code=err.response.status_code,
        detail=err.response.text or str(err),
    )


@app.get("/api/status")
async def status():
    """Check if token is available."""
    try:
        t = get_token()
        return {"ok": True, "token_set": bool(t)}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.get("/api/profiles")
async def api_list_profiles(
    page: int = 1,
    search: str | None = None,
    sorter_field: str = "createdAt",
    sorter_order: str = "descend",
):
    token = _get_token()
    try:
        return await list_profiles(
            token,
            page=page,
            search=search or None,
            sorter_field=sorter_field,
            sorter_order=sorter_order,
        )
    except httpx.HTTPStatusError as e:
        _handle_http(e)


@app.get("/api/profiles/{profile_id}")
async def api_get_profile(profile_id: str):
    token = _get_token()
    try:
        return await get_profile(token, profile_id)
    except httpx.HTTPStatusError as e:
        _handle_http(e)


class CreateProfileBody(BaseModel):
    name: str = "New Profile"
    os: str = "mac"
    osSpec: str = ""


@app.post("/api/profiles")
async def api_create_profile(body: CreateProfileBody):
    token = _get_token()
    try:
        return await create_quick_profile(
            token,
            name=body.name,
            os_type=body.os,
            os_spec=body.osSpec or "",
        )
    except httpx.HTTPStatusError as e:
        _handle_http(e)


class AddProxyBody(BaseModel):
    countryCode: str
    profileIdToLink: str | None = None
    city: str | None = None
    isMobile: bool = True
    isDC: bool = False


@app.post("/api/proxies")
async def api_add_proxy(body: AddProxyBody):
    token = _get_token()
    try:
        return await add_mobile_proxy(
            token,
            country_code=body.countryCode,
            profile_id_to_link=body.profileIdToLink,
            city=body.city,
            is_mobile=body.isMobile,
            is_dc=body.isDC,
        )
    except httpx.HTTPStatusError as e:
        _handle_http(e)


class QuickCreateBody(BaseModel):
    name: str = "offers"
    os: str = "mac"
    countryCode: str = "us"
    city: str = "New York"
    isMobile: bool = True


@app.post("/api/quick-create")
async def api_quick_create(body: QuickCreateBody):
    """Create profile + attach mobile proxy in one step."""
    token = _get_token()
    try:
        profile = await create_quick_profile(
            token,
            name=body.name,
            os_type=body.os,
            os_spec="",
        )
        profile_id = profile.get("id")
        if not profile_id:
            raise HTTPException(status_code=500, detail="Profile created but no id returned")
        await add_mobile_proxy(
            token,
            country_code=body.countryCode,
            profile_id_to_link=profile_id,
            city=body.city or None,
            is_mobile=body.isMobile,
            is_dc=False,
        )
        return {"profile": profile, "proxy_linked": True}
    except httpx.HTTPStatusError as e:
        _handle_http(e)


class DeleteProfilesBody(BaseModel):
    profilesToDelete: list[str]


@app.delete("/api/profiles")
async def api_delete_profiles(body: DeleteProfilesBody):
    token = _get_token()
    try:
        await delete_profiles(token, body.profilesToDelete)
        return {"deleted": len(body.profilesToDelete)}
    except httpx.HTTPStatusError as e:
        _handle_http(e)


class RenameBody(BaseModel):
    profileId: str
    name: str


@app.patch("/api/profiles/rename")
async def api_rename_profile(body: RenameBody):
    token = _get_token()
    try:
        await rename_profile(token, body.profileId, body.name)
        return {"ok": True}
    except httpx.HTTPStatusError as e:
        _handle_http(e)


@app.get("/api/traffic")
async def api_get_traffic():
    token = _get_token()
    try:
        return await get_proxy_traffic(token)
    except httpx.HTTPStatusError as e:
        _handle_http(e)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
