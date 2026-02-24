"""GoLogin API client. Reads token from ARC_API_KEYS.txt."""

import re
from pathlib import Path

import httpx

API_URL = "https://api.gologin.com"


def get_token() -> str:
    """Read GoLogin API token from permissions folder."""
    perm_path = Path.home() / "Documents" / "permissions" / "ARC_API_KEYS.txt"
    if not perm_path.exists():
        raise FileNotFoundError(f"Permissions file not found: {perm_path}")
    content = perm_path.read_text()
    match = re.search(
        r"GOSCREEN/GOLOIGN.*?API_TOKEN:\s*(\S+)",
        content,
        re.DOTALL | re.IGNORECASE,
    )
    if not match:
        raise ValueError("GoLogin API token not found in ARC_API_KEYS.txt")
    return match.group(1).strip()


def _headers(token: str) -> dict:
    return {
        "Authorization": f"Bearer {token}",
        "User-Agent": "gologin-control",
        "Content-Type": "application/json",
    }


async def list_profiles(
    token: str,
    page: int = 1,
    search: str | None = None,
    sorter_field: str = "createdAt",
    sorter_order: str = "descend",
) -> dict:
    """GET /browser/v2 - list profiles with pagination."""
    params = {"page": page, "sorterField": sorter_field, "sorterOrder": sorter_order}
    if search:
        params["search"] = search
    r = await httpx.AsyncClient().get(
        f"{API_URL}/browser/v2",
        headers=_headers(token),
        params=params,
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


async def get_profile(token: str, profile_id: str) -> dict:
    """GET /browser/{id} - get single profile."""
    r = await httpx.AsyncClient().get(
        f"{API_URL}/browser/{profile_id}",
        headers=_headers(token),
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


async def create_quick_profile(token: str, name: str, os_type: str, os_spec: str = "") -> dict:
    """POST /browser/quick - create profile with template."""
    payload: dict = {"os": os_type, "osSpec": os_spec}
    if name:
        payload["name"] = name
    r = await httpx.AsyncClient().post(
        f"{API_URL}/browser/quick",
        headers=_headers(token),
        json=payload,
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


async def add_mobile_proxy(
    token: str,
    country_code: str,
    profile_id_to_link: str | None = None,
    city: str | None = None,
    is_mobile: bool = True,
    is_dc: bool = False,
) -> dict:
    """POST /users-proxies/mobile-proxy - create GoLogin proxy, optionally link to profile."""
    payload: dict = {
        "countryCode": country_code.lower(),
        "isMobile": is_mobile,
        "isDC": is_dc,
    }
    if profile_id_to_link:
        payload["profileIdToLink"] = profile_id_to_link
    if city:
        payload["city"] = city
    r = await httpx.AsyncClient().post(
        f"{API_URL}/users-proxies/mobile-proxy",
        headers=_headers(token),
        json=payload,
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


async def delete_profiles(token: str, profile_ids: list[str]) -> None:
    """DELETE /browser - delete multiple profiles."""
    r = await httpx.AsyncClient().delete(
        f"{API_URL}/browser",
        headers=_headers(token),
        json={"profilesToDelete": profile_ids},
        timeout=30,
    )
    r.raise_for_status()


async def rename_profile(token: str, profile_id: str, name: str) -> None:
    """PATCH /browser/name/many - rename profile."""
    r = await httpx.AsyncClient().patch(
        f"{API_URL}/browser/name/many",
        headers=_headers(token),
        json=[{"profileId": profile_id, "name": name}],
        timeout=30,
    )
    r.raise_for_status()


async def get_proxy_traffic(token: str) -> dict:
    """GET /users-proxies/geolocation/traffic - proxy traffic left."""
    r = await httpx.AsyncClient().get(
        f"{API_URL}/users-proxies/geolocation/traffic",
        headers=_headers(token),
        timeout=30,
    )
    r.raise_for_status()
    return r.json()
