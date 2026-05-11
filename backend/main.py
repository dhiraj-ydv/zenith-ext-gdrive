from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse, JSONResponse
from pathlib import Path
import os
import json
import httpx
import base64

router = APIRouter(prefix="/api/gdrive", tags=["Google Drive"])

# State
note_service = None
vault_manager = None

def get_settings_path():
    if not vault_manager or not vault_manager.get_active_vault():
        return None
    path = vault_manager.plugins_dir / "official-gdrive" / "settings.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    return path

def load_settings():
    path = get_settings_path()
    if path and path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except:
            return {}
    return {}

def save_settings(settings):
    path = get_settings_path()
    if path:
        path.write_text(json.dumps(settings, indent=2), encoding="utf-8")

@router.get("/status")
async def get_status():
    settings = load_settings()
    is_connected = "access_token" in settings
    return {
        "status": "connected" if is_connected else "unauthenticated",
        "email": settings.get("email", "Not connected")
    }

@router.post("/connect")
async def connect(data: dict):
    # For a real app, this would redirect to Google OAuth.
    # Here we'll expect the user to provide a JSON of their credentials for now
    # or handle a simplified flow.
    save_settings(data)
    return {"message": "Credentials saved"}

@router.post("/sync")
async def start_sync():
    settings = load_settings()
    if "access_token" not in settings:
        raise HTTPException(status_code=401, detail="Not authenticated with Google Drive")
    
    # TODO: Actual file sync logic using httpx to call Drive API
    # 1. List files in 'Zenith' folder on Drive
    # 2. Compare with local notes
    # 3. Upload/Download changes
    return {"message": "Sync completed successfully (mocked)"}

def setup(app, services):
    global note_service, vault_manager
    note_service = services.get("note_service")
    vault_manager = services.get("vault_manager")
    
    app.include_router(router)
    print("[OK] Google Drive Sync backend initialized")
