#!/usr/bin/env python3

"""
Command-line interface for Redis Lens.
"""

import typer
import webbrowser
import time
import uvicorn
import os
import sys
import threading
import logging
from pathlib import Path
from .offline_assets import download_assets

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("redis-lens")

app = typer.Typer(help="Redis Lens - A modern Redis monitoring and management tool")

def open_browser(host: str, port: int):
    """Open the Redis Lens UI in the default web browser after a short delay."""
    # Wait a bit for the server to start
    time.sleep(1.5)
    url = f"http://{host}:{port}"
    logger.info(f"Opening Redis Lens in your browser: {url}")
    webbrowser.open(url)

@app.command()
def start(
    host: str = typer.Option("localhost", help="Host to bind the server to"),
    port: int = typer.Option(8005, help="Port to bind the server to"),
    no_browser: bool = typer.Option(False, help="Do not open a browser window automatically"),
    debug: bool = typer.Option(False, help="Run in debug mode"),
    download_cdn: bool = typer.Option(True, help="Download CDN assets for offline use")
):
    """Start the Redis Lens server and open the UI in a browser."""
    # Download assets if needed
    if download_cdn:
        try:
            download_assets()
        except Exception as e:
            logger.warning(f"Failed to download CDN assets: {e}. Using CDN links instead.")

    # Log startup information
    logger.info(f"Starting Redis Lens server on http://{host}:{port}")
    
    # Open browser in a separate thread if not disabled
    if not no_browser:
        browser_thread = threading.Thread(target=open_browser, args=(host, port))
        browser_thread.daemon = True
        browser_thread.start()
    
    # Start the server
    # Use the module name as the path to the API
    uvicorn.run("redis_lens.api:app", host=host, port=port, reload=debug, log_level="info")

@app.command()
def version():
    """Show version information."""
    from . import __version__
    typer.echo(f"Redis Lens v{__version__}")

def main():
    """Main entry point for the CLI."""
    app()

if __name__ == "__main__":
    main()