#ipt to test redis server functionality with various data types
# make sure to install redis-py: pip install redis
import redis
import random
import string

def random_string(length=8):
    """
    generate a random alphanumeric string of given length
    """
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def populate_strings(client, count=5):
    """
    populate redis with simple string key-value pairs
    """
    for i in range(count):
        key = f"string:key:{i}"
        value = random_string()
        client.set(key, value)
        print(f"set string {key} -> {value}")

def populate_lists(client, count=5, list_length=5):
    """
    populate redis with lists of random values
    """
    for i in range(count):
        key = f"list:key:{i}"
        values = [random_string() for _ in range(list_length)]
        client.rpush(key, *values)
        print(f"created list {key} with values {values}")

def populate_sets(client, count=5, set_size=5):
    """
    populate redis with sets of random values
    """
    for i in range(count):
        key = f"set:key:{i}"
        values = {random_string() for _ in range(set_size)}
        client.sadd(key, *values)
        print(f"created set {key} with members {values}")

def populate_hashes(client, count=5, fields=5):
    """
    populate redis with hashes having random field-value pairs
    """
    for i in range(count):
        key = f"hash:key:{i}"
        mapping = {f"field{j}": random_string() for j in range(fields)}
        client.hset(key, mapping=mapping)
        print(f"created hash {key} with mapping {mapping}")

def populate_sorted_sets(client, count=5, set_size=5):
    """
    populate redis with sorted sets of random values and scores
    """
    for i in range(count):
        key = f"zset:key:{i}"
        members = {random_string(): random.random() * 100 for _ in range(set_size)}
        client.zadd(key, members)
        print(f"created sorted set {key} with members {members}")


def populate_redis(host='localhost', port=6379, db=0, count=5):
    """
    connect to redis and populate various data types
    """
    client = redis.Redis(host=host, port=port, db=db)

    # verify connection
    try:
        client.ping()
        print(f"connected to redis at {host}:{port}, db={db}")
    except redis.exceptions.ConnectionError:
        print(f"failed to connect to redis at {host}:{port}")
        return

    # populate different data types
    populate_strings(client, count)
    populate_lists(client, count)
    populate_sets(client, count)
    populate_hashes(client, count)
    populate_sorted_sets(client, count)

    print(f"successfully populated redis database with {count} entries for each data type.")

if __name__ == '__main__':
    # populate default redis server with 5 entries of each type
    populate_redis()
