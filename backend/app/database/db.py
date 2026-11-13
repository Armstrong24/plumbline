"""Small SQLite repository for local development/testing.

OAuth credentials are persisted only on the server. Before deploying publicly,
replace this development store with managed PostgreSQL and encryption at rest.
"""
from __future__ import annotations

import os
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
DB_PATH = Path(os.getenv("DATABASE_PATH", str(BASE_DIR / "data" / "plumbline.sqlite3")))


def connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DB_PATH, timeout=20)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    return db


def init_db() -> None:
    with connect() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                password_salt TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'owner',
                workspace_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                last_login TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS sessions (
                token_hash TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                expires_at TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS oauth_states (
                state TEXT PRIMARY KEY,
                provider TEXT NOT NULL,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                code_verifier TEXT,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS social_connections (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                platform TEXT NOT NULL,
                account_id TEXT NOT NULL,
                account_name TEXT NOT NULL,
                handle TEXT NOT NULL DEFAULT '',
                access_token TEXT NOT NULL,
                refresh_token TEXT,
                expires_at TEXT,
                metadata_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(user_id, platform, account_id)
            );
            CREATE INDEX IF NOT EXISTS ix_social_connections_user ON social_connections(user_id);
            CREATE TABLE IF NOT EXISTS workspace_data (
                workspace_id TEXT NOT NULL,
                data_key TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                PRIMARY KEY(workspace_id, data_key)
            );
            CREATE TABLE IF NOT EXISTS posts (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                platform TEXT NOT NULL,
                body TEXT NOT NULL,
                provider_post_id TEXT,
                permalink TEXT,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS comments (
                id TEXT NOT NULL,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                platform TEXT NOT NULL,
                post_id TEXT,
                author_name TEXT NOT NULL DEFAULT '',
                author_handle TEXT NOT NULL DEFAULT '',
                text TEXT NOT NULL,
                created_at TEXT NOT NULL,
                reply_count INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY(user_id, platform, id)
            );
            """
        )
