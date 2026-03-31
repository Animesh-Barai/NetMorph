import aiosqlite
import os
import json
from pathlib import Path

# Database path (Project root for now)
DB_PATH = Path("rules.db")

async def init_db():
    """Initialize the SQLite database with the rules, traffic_logs, and workspaces tables."""
    async with aiosqlite.connect(DB_PATH) as db:
        # 1. Create Workspaces Table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS workspaces (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                is_active BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 2. Ensure Default Workspace Exists
        await db.execute("""
            INSERT OR IGNORE INTO workspaces (id, name, description, is_active)
            VALUES ('default', 'Default Workspace', 'Auto-generated workspace for existing rules', 1)
        """)

        # 3. Create Rules Table (with Workspace support)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS rules (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                match_type TEXT NOT NULL,
                pattern TEXT NOT NULL,
                actions TEXT NOT NULL, -- JSON blob
                is_active BOOLEAN DEFAULT 1,
                delay INTEGER DEFAULT 0,
                workspace_id TEXT DEFAULT 'default',
                FOREIGN KEY (workspace_id) REFERENCES workspaces (id)
            )
        """)

        # 4. Migration: Add workspace_id to rules if it's missing (Safe for older DBs)
        try:
            await db.execute("ALTER TABLE rules ADD COLUMN workspace_id TEXT DEFAULT 'default'")
        except aiosqlite.OperationalError:
            # Column already exists
            pass
        
        # 5. Create Traffic Logs Table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS traffic_logs (
                id TEXT PRIMARY KEY,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                method TEXT NOT NULL,
                url TEXT NOT NULL,
                path TEXT,
                status INTEGER,
                content_type TEXT,
                latency REAL,
                request_headers TEXT, -- JSON
                response_headers TEXT, -- JSON
                rule_id TEXT,
                stage TEXT, -- 'request' or 'response'
                overhead REAL DEFAULT 0
            )
        """)
        
        # 6. Migration: Add overhead to traffic_logs if it's missing
        try:
            await db.execute("ALTER TABLE traffic_logs ADD COLUMN overhead REAL DEFAULT 0")
        except aiosqlite.OperationalError:
            pass
        
        await db.commit()
