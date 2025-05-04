#!/usr/bin/env python3

import argparse
import os
import sys
import webbrowser
import time
from threading import Timer
import uvicorn
from .version import __version__


def open_browser(host, port):
    """Open the browser after a short delay."""
    url = f"http://{host}:{port}"
    print(f"Opening Redis Lens in your browser: {url}")
    # Wait a bit for the server to start
    time.sleep(1.5)
    webbrowser.open(url)


def main():
    """Main entry point for the Redis Lens CLI."""
    parser = argparse.ArgumentParser(
        description="Redis Lens - A beautiful Redis GUI client"
    )
    subparsers = parser.add_subparsers(dest="command")

    # Start command
    start_parser = subparsers.add_parser("start", help="Start Redis Lens server")
    start_parser.add_argument(
        "--host", default="localhost", help="Server host (default: localhost)"
    )
    start_parser.add_argument(
        "--port", type=int, default=8005, help="Server port (default: 8005)"
    )
    start_parser.add_argument(
        "--debug", action="store_true", help="Run in debug mode with auto-reload"
    )
    start_parser.add_argument(
        "--no-browser", action="store_true", help="Don't open the browser automatically"
    )

    # Version command
    version_parser = subparsers.add_parser("version", help="Show version information")

    args = parser.parse_args()

    # If no command is provided, use 'start'
    if not args.command:
        args.command = "start"
        args.host = "localhost"
        args.port = 8005
        args.debug = False
        args.no_browser = False

    if args.command == "version":
        print(f"Redis Lens v{__version__}")
        return

    elif args.command == "start":
        # Check if static files directory exists
        package_dir = os.path.dirname(os.path.abspath(__file__))
        static_dir = os.path.join(package_dir, "static")

        if not os.path.exists(static_dir):
            print(
                "Warning: Static files directory not found. Redis Lens may not work correctly."
            )

        # Open browser in a separate thread if not disabled
        if not args.no_browser:
            Timer(1, open_browser, args=[args.host, args.port]).start()

        print(f"Starting Redis Lens on http://{args.host}:{args.port}...")

        # Adjust the import path to use the package module
        uvicorn.run(
            "redislens.api:app", host=args.host, port=args.port, reload=args.debug
        )


if __name__ == "__main__":
    main()