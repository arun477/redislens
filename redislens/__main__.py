#!/usr/bin/env python3

"""
Entry point for the Redis Lens package.
This allows users to run `python -m redis_lens` to start the application.
"""

from redislens.cli import main

if __name__ == "__main__":
    main()