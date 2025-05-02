import redis
from typing import Any, Dict, List, Optional, Union

class RedisClient:
    def __init__(self, host: str = 'localhost', port: int = 6379, db: int = 0, password: Optional[str] = None):
        self.redis_client = redis.Redis(
            host=host,
            port=port,
            db=db,
            password=password,
            decode_responses=True
        )
    
    def ping(self) -> bool:
        """Check if Redis server is accessible."""
        try:
            return self.redis_client.ping()
        except redis.ConnectionError:
            return False
    
    def get_info(self) -> Dict[str, str]:
        """Get Redis server info."""
        return self.redis_client.info()
    
    def get_keys(self, pattern: str = '*') -> List[str]:
        """Get all keys matching pattern."""
        return self.redis_client.keys(pattern)
    
    def get_value(self, key: str) -> Any:
        """Get value for a specific key."""
        key_type = self.redis_client.type(key)
        
        if key_type == 'string':
            return self.redis_client.get(key)
        elif key_type == 'list':
            return self.redis_client.lrange(key, 0, -1)
        elif key_type == 'set':
            return list(self.redis_client.smembers(key))
        elif key_type == 'zset':
            return self.redis_client.zrange(key, 0, -1, withscores=True)
        elif key_type == 'hash':
            return self.redis_client.hgetall(key)
        else:
            return None
    
    def delete_key(self, key: str) -> bool:
        """Delete a key."""
        return bool(self.redis_client.delete(key))
    
    def execute_command(self, command: str, *args) -> Any:
        """Execute arbitrary Redis command."""
        return self.redis_client.execute_command(command, *args)
    
    def get_memory_usage(self, key: str) -> int:
        """Get memory usage of key in bytes."""
        return self.redis_client.memory_usage(key)
    
    def get_ttl(self, key: str) -> int:
        """Get TTL of key in seconds."""
        return self.redis_client.ttl(key)