import redis
from typing import Any, Dict, List, Optional, Union
import time
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("redis-lens.redis-client")


class RedisClient:
    def __init__(
        self,
        host: str = "localhost",
        port: int = 6379,
        db: int = 0,
        password: Optional[str] = None,
    ):
        """Initialize a Redis client with connection parameters."""
        self.connection_params = {
            "host": host,
            "port": port,
            "db": db,
            "password": password,
            "decode_responses": True,
        }

        self.redis_client = redis.Redis(**self.connection_params)

    def ping(self) -> bool:
        """Check if Redis server is accessible."""
        try:
            return self.redis_client.ping()
        except redis.ConnectionError as e:
            logger.error(f"Redis connection error: {e}")
            return False
        except Exception as e:
            logger.error(f"Error pinging Redis: {e}")
            return False

    def get_info(self) -> Dict[str, str]:
        """Get Redis server info."""
        return self.redis_client.info()

    def get_keys(self, pattern: str = "*") -> List[str]:
        """Get all keys matching pattern."""
        # For smaller instances, use KEYS command
        try:
            # First check if we can get an approximate count
            if pattern == "*":
                # Use DBSIZE for faster response if checking all keys
                key_count = self.redis_client.dbsize()
                if key_count > 10000:
                    # For large databases, use SCAN instead of KEYS
                    logger.info(
                        f"Large database detected ({key_count} keys), using SCAN instead of KEYS"
                    )
                    return self._scan_keys(pattern)

            # For most cases, KEYS is faster than SCAN for pattern matching
            return self.redis_client.keys(pattern)
        except redis.ResponseError as e:
            logger.warning(f"KEYS command failed, falling back to SCAN: {e}")
            # Fall back to SCAN if KEYS fails or is disabled
            return self._scan_keys(pattern)
        except Exception as e:
            logger.error(f"Error getting keys: {e}")
            raise

    def _scan_keys(self, pattern: str = "*") -> List[str]:
        """Get keys using SCAN command (safer for production)."""
        keys = []
        cursor = 0
        while True:
            cursor, batch = self.redis_client.scan(
                cursor=cursor, match=pattern, count=1000
            )
            keys.extend(batch)
            if cursor == 0:
                break
        return keys

    def get_keys_paginated(
        self, pattern: str = "*", page: int = 1, per_page: int = 50
    ) -> Dict[str, Any]:
        """Get paginated keys matching pattern."""
        all_keys = self.get_keys(pattern)
        total_keys = len(all_keys)

        # Calculate pagination
        start_index = (page - 1) * per_page
        end_index = min(start_index + per_page, total_keys)

        # Get the page of keys
        paginated_keys = all_keys[start_index:end_index] if all_keys else []

        return {
            "keys": paginated_keys,
            "count": len(paginated_keys),
            "total": total_keys,
            "page": page,
            "per_page": per_page,
            "total_pages": (total_keys + per_page - 1) // per_page
            if total_keys > 0
            else 0,
        }

    def get_value(self, key: str) -> Any:
        """Get value for a specific key."""
        try:
            key_type = self.redis_client.type(key)

            if key_type == "string":
                return self.redis_client.get(key)
            elif key_type == "list":
                return self.redis_client.lrange(key, 0, -1)
            elif key_type == "set":
                return list(self.redis_client.smembers(key))
            elif key_type == "zset":
                # Handle sorted sets by returning both members and scores
                members_with_scores = []
                zset_pairs = self.redis_client.zrange(key, 0, -1, withscores=True)
                for member, score in zset_pairs:
                    members_with_scores.append(member)
                    members_with_scores.append(str(score))
                return members_with_scores
            elif key_type == "hash":
                return self.redis_client.hgetall(key)
            else:
                logger.warning(f"Unknown key type: {key_type} for key: {key}")
                return None
        except Exception as e:
            logger.error(f"Error getting value for key {key}: {e}")
            raise

    def delete_key(self, key: str) -> bool:
        """Delete a key."""
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            logger.error(f"Error deleting key {key}: {e}")
            raise

    def execute_command(self, command: str, *args) -> Any:
        """Execute arbitrary Redis command."""
        try:
            logger.info(f"Executing command: {command} {args}")
            return self.redis_client.execute_command(command, *args)
        except Exception as e:
            logger.error(f"Error executing command {command}: {e}")
            raise

    def get_memory_usage(self, key: str) -> int:
        """Get memory usage of key in bytes."""
        try:
            return self.redis_client.memory_usage(key)
        except redis.ResponseError as e:
            logger.warning(f"Memory usage command not supported: {e}. Returning 0.")
            # Fall back for Redis servers that don't support MEMORY command
            return 0
        except Exception as e:
            logger.error(f"Error getting memory usage for key {key}: {e}")
            raise

    def get_ttl(self, key: str) -> int:
        """Get TTL of key in seconds."""
        try:
            return self.redis_client.ttl(key)
        except Exception as e:
            logger.error(f"Error getting TTL for key {key}: {e}")
            raise

    def get_stats(self) -> Dict[str, Any]:
        """Get additional statistics about the Redis server."""
        try:
            stats = {}
            info = self.get_info()

            # Add memory stats
            stats["memory"] = {
                "used_memory": info.get("used_memory", 0),
                "used_memory_human": info.get("used_memory_human", "0B"),
                "used_memory_peak": info.get("used_memory_peak", 0),
                "used_memory_peak_human": info.get("used_memory_peak_human", "0B"),
                "used_memory_dataset": info.get("used_memory_dataset", 0),
                "mem_fragmentation_ratio": info.get("mem_fragmentation_ratio", 0),
            }

            # Add key stats
            key_count = self.redis_client.dbsize()
            stats["keys"] = {
                "total": key_count,
            }

            # Add performance stats
            stats["performance"] = {
                "instantaneous_ops_per_sec": info.get("instantaneous_ops_per_sec", 0),
                "total_commands_processed": info.get("total_commands_processed", 0),
                "total_connections_received": info.get("total_connections_received", 0),
                "connected_clients": info.get("connected_clients", 0),
            }

            return stats
        except Exception as e:
            logger.error(f"Error getting Redis stats: {e}")
            raise

    def search_by_prefix(self, prefix: str, limit: int = 100) -> List[str]:
        """Search keys by prefix, optimized for faster searching."""
        try:
            return self.redis_client.keys(f"{prefix}*")[:limit]
        except Exception as e:
            logger.error(f"Error searching by prefix {prefix}: {e}")
            raise