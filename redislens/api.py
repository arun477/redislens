from fastapi import FastAPI, HTTPException, Query, Depends, Request, Response, Body
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel
import os
import json
import math
import logging
from pathlib import Path

from .redis_client import RedisClient

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("redis-lens.api")

# Get package directory
package_dir = Path(__file__).parent.absolute()
build_dir = package_dir / "build"
static_dir = package_dir / "static"

# Create the FastAPI app
app = FastAPI(title="Redis Lens API", description="API for exploring Redis server")

# Add CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static directories
if build_dir.exists():
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    logger.info(f"Mounted static directory: {static_dir}")
else:
    logger.warning(f"Build directory not found at {build_dir}")

class RedisConnection(BaseModel):
    host: str = "localhost"
    port: int = 6379
    db: int = 0
    password: Optional[str] = None

class RedisCommand(BaseModel):
    command: str
    args: List[str] = []

class PaginationParams(BaseModel):
    page: int = 1
    per_page: int = 50
    pattern: str = "*"

def get_redis_client(conn: RedisConnection = Depends()):
    client = RedisClient(
        host=conn.host,
        port=conn.port,
        db=conn.db,
        password=conn.password
    )
    if not client.ping():
        raise HTTPException(status_code=500, detail="Could not connect to Redis server")
    return client

@app.get("/", response_class=FileResponse)
async def get_index():
    """Serve the main UI page."""
    index_path = build_dir / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    else:
        raise HTTPException(status_code=404, detail="UI not found. Please ensure the package was installed correctly.")

@app.get("/{catch_all:path}", response_class=FileResponse)
async def catch_all(catch_all: str):
    """Serve the main UI page for any non-API route for client-side routing."""
    if catch_all.startswith("api/"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
    
    # Check if the path exists in the build directory (for static assets)
    asset_path = build_dir / catch_all
    if asset_path.exists() and asset_path.is_file():
        return FileResponse(asset_path)
    
    # Otherwise, serve the index.html for client-side routing
    index_path = build_dir / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    else:
        raise HTTPException(status_code=404, detail="UI not found. Please ensure the package was installed correctly.")

@app.post("/api/ping")
def ping(conn: RedisConnection):
    client = RedisClient(
        host=conn.host,
        port=conn.port,
        db=conn.db,
        password=conn.password
    )
    if client.ping():
        return {"status": "ok", "message": "Connected to Redis server"}
    raise HTTPException(status_code=500, detail="Could not connect to Redis server")

@app.post("/api/info")
def get_info(client: RedisClient = Depends(get_redis_client)):
    try:
        return {"info": client.get_info()}
    except Exception as e:
        logger.error(f"Error fetching Redis info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching Redis info: {str(e)}")

@app.post("/api/keys")
def get_keys(
    pattern: str = "*", 
    page: int = 1, 
    per_page: int = 50,
    client: RedisClient = Depends(get_redis_client)
):
    try:
        # Get all keys matching the pattern
        all_keys = client.get_keys(pattern)
        total_keys = len(all_keys)
        
        # Calculate pagination
        total_pages = math.ceil(total_keys / per_page) if total_keys > 0 else 0
        start_index = (page - 1) * per_page
        end_index = min(start_index + per_page, total_keys)
        
        # Get the paginated slice of keys
        paginated_keys = all_keys[start_index:end_index] if all_keys else []
        
        return {
            "keys": paginated_keys,
            "count": len(paginated_keys),
            "total": total_keys,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        }
    except Exception as e:
        logger.error(f"Error fetching keys: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching keys: {str(e)}")

@app.post("/api/key/{key}")
def get_key(key: str, client: RedisClient = Depends(get_redis_client)):
    try:
        keys = client.get_keys()
        if key not in keys:
            raise HTTPException(status_code=404, detail=f"Key '{key}' not found")
        
        key_type = client.redis_client.type(key)
        value = client.get_value(key)
        ttl = client.get_ttl(key)
        memory = client.get_memory_usage(key)
        
        return {
            "key": key,
            "type": key_type,
            "value": value,
            "ttl": ttl,
            "memory_usage": memory
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching key details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching key details: {str(e)}")

@app.delete("/api/key/{key}")
def delete_key(key: str, client: RedisClient = Depends(get_redis_client)):
    try:
        keys = client.get_keys()
        if key not in keys:
            raise HTTPException(status_code=404, detail=f"Key '{key}' not found")
        
        result = client.delete_key(key)
        if result:
            return {"status": "ok", "message": f"Successfully deleted key: {key}"}
        raise HTTPException(status_code=500, detail=f"Failed to delete key: {key}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting key: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting key: {str(e)}")

@app.post("/api/execute")
def execute_command(command_data: RedisCommand, client: RedisClient = Depends(get_redis_client)):
    try:
        result = client.execute_command(command_data.command, *command_data.args)
        return {"result": result}
    except Exception as e:
        logger.error(f"Error executing command: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error executing command: {str(e)}")

@app.post("/api/keys/delete")
def delete_multiple_keys(data: dict = Body(...), client: RedisClient = Depends(get_redis_client)):
    keys = data.get("keys", [])
    if not keys:
        raise HTTPException(status_code=400, detail="No keys provided")
        
    deleted_count = 0
    errors = []
    
    for key in keys:
        try:
            if client.delete_key(key):
                deleted_count += 1
            else:
                errors.append(f"Key not found: {key}")
        except Exception as e:
            errors.append(f"Error deleting key '{key}': {str(e)}")
    
    return {
        "status": "ok" if not errors else "partial",
        "deleted_count": deleted_count,
        "total_count": len(keys),
        "errors": errors
    }