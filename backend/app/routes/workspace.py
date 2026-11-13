from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.database.db import connect
from app.routes.auth import require_user

router = APIRouter(prefix="/api/workspace", tags=["workspace"])
ALLOWED_KEYS = {
    "workspace", "guidelines", "guideline_versions", "posts", "comments",
    "onboarding_completed", "clean_workspace"
}


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


class WorkspaceDataBody(BaseModel):
    data: dict[str, Any]


@router.get("/data")
async def get_workspace_data(user: dict = Depends(require_user)):
    with connect() as db:
        rows = db.execute(
            "SELECT data_key,payload_json FROM workspace_data WHERE workspace_id=?",
            (user["workspaceId"],),
        ).fetchall()
    result: dict[str, Any] = {}
    for row in rows:
        try:
            result[row["data_key"]] = json.loads(row["payload_json"])
        except json.JSONDecodeError:
            continue
    return result


@router.put("/data")
async def save_workspace_data(body: WorkspaceDataBody, user: dict = Depends(require_user)):
    unknown = set(body.data) - ALLOWED_KEYS
    if unknown:
        raise HTTPException(status_code=400, detail=f"Unsupported workspace data keys: {', '.join(sorted(unknown))}")
    serialised: list[tuple[str, str, str, str]] = []
    for key, value in body.data.items():
        payload = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
        if len(payload.encode("utf-8")) > 5_000_000:
            raise HTTPException(status_code=413, detail=f"Workspace data item '{key}' exceeds the 5 MB test-build limit.")
        serialised.append((user["workspaceId"], key, payload, now()))
    with connect() as db:
        for values in serialised:
            db.execute(
                """INSERT INTO workspace_data(workspace_id,data_key,payload_json,updated_at) VALUES(?,?,?,?)
                ON CONFLICT(workspace_id,data_key) DO UPDATE SET payload_json=excluded.payload_json,updated_at=excluded.updated_at""",
                values,
            )
    return {"status": "saved", "keys": list(body.data.keys())}


@router.get("/members")
async def get_workspace_members(user: dict = Depends(require_user)):
    with connect() as db:
        rows = db.execute(
            "SELECT id,full_name,email,role,created_at,last_login FROM users WHERE workspace_id=? ORDER BY created_at",
            (user["workspaceId"],),
        ).fetchall()
        posts_row = db.execute(
            "SELECT payload_json FROM workspace_data WHERE workspace_id=? AND data_key='posts'",
            (user["workspaceId"],),
        ).fetchone()
    try:
        posts = json.loads(posts_row["payload_json"]) if posts_row else []
    except (json.JSONDecodeError, TypeError):
        posts = []
    members = []
    for row in rows:
        authored = [post for post in posts if post.get("creatorId") == row["id"]]
        members.append({
            "id": row["id"], "name": row["full_name"], "email": row["email"],
            "role": row["role"], "department": "", "status": "active",
            "draftCount": sum(1 for post in authored if post.get("status") == "draft"),
            "pendingSubmissions": sum(1 for post in authored if post.get("status") == "in_review"),
            "lastActive": row["last_login"]
        })
    return members
