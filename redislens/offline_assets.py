#!/usr/bin/env python3

"""
Script to download CDN assets for offline use.
"""

import os
import requests
import logging
import shutil
from pathlib import Path
import re

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("redis-lens.offline-assets")

# Asset URLs
ASSETS = {
    "tailwind": "https://cdn.tailwindcss.com",
    "fontawesome": "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
    "fontawesome_webfonts": [
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2",
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-regular-400.woff2",
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2"
    ]
}

def get_package_dir():
    """Get the directory of the current package."""
    return Path(__file__).parent.absolute()

def create_vendor_dir():
    """Create the vendor directory if it doesn't exist."""
    vendor_dir = get_package_dir() / "static" / "vendor"
    vendor_dir.mkdir(parents=True, exist_ok=True)
    
    # Create webfonts subdirectory for Font Awesome
    webfonts_dir = vendor_dir / "webfonts"
    webfonts_dir.mkdir(exist_ok=True)
    
    return vendor_dir

def download_file(url, output_path):
    """Download a file from a URL to a local path."""
    logger.info(f"Downloading {url} to {output_path}")
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    with open(output_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    return output_path

def fix_font_awesome_paths(css_file_path):
    """Fix the Font Awesome CSS file to use local paths for webfonts."""
    logger.info(f"Fixing Font Awesome paths in {css_file_path}")
    
    with open(css_file_path, 'r', encoding='utf-8') as f:
        css_content = f.read()
    
    # Replace CDN paths with local paths
    modified_content = re.sub(
        r'url\(([^)]+)/webfonts/',
        r'url(./webfonts/',
        css_content
    )
    
    with open(css_file_path, 'w', encoding='utf-8') as f:
        f.write(modified_content)

def update_index_html():
    """Update the index.html file to use local assets."""
    build_dir = get_package_dir() / "build"
    if not build_dir.exists():
        logger.warning("Build directory not found, skipping index.html update")
        return
    
    index_path = build_dir / "index.html"
    if not index_path.exists():
        logger.warning("index.html not found in build directory")
        return
    
    logger.info(f"Updating {index_path} to use local assets")
    
    with open(index_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Replace CDN links with local ones
    modified_html = html_content.replace(
        '<script src="https://cdn.tailwindcss.com"></script>',
        '<script src="/static/vendor/tailwind.min.js"></script>'
    )
    
    modified_html = modified_html.replace(
        '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />',
        '<link rel="stylesheet" href="/static/vendor/all.min.css" />'
    )
    
    # Create a backup of the original file
    backup_path = index_path.with_suffix('.html.bak')
    shutil.copy2(index_path, backup_path)
    
    # Write the modified content
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(modified_html)
    
    logger.info(f"Updated index.html and created backup at {backup_path}")

def download_assets():
    """Download all assets and update the index.html file."""
    vendor_dir = create_vendor_dir()
    
    # Download Tailwind
    tailwind_path = vendor_dir / "tailwind.min.js"
    if not tailwind_path.exists():
        try:
            download_file(ASSETS["tailwind"], tailwind_path)
        except Exception as e:
            logger.error(f"Failed to download Tailwind: {e}")
    else:
        logger.info(f"Tailwind already exists at {tailwind_path}")
    
    # Download Font Awesome CSS
    fa_css_path = vendor_dir / "all.min.css"
    if not fa_css_path.exists():
        try:
            download_file(ASSETS["fontawesome"], fa_css_path)
            fix_font_awesome_paths(fa_css_path)
        except Exception as e:
            logger.error(f"Failed to download Font Awesome CSS: {e}")
    else:
        logger.info(f"Font Awesome CSS already exists at {fa_css_path}")
    
    # Download Font Awesome webfonts
    webfonts_dir = vendor_dir / "webfonts"
    for webfont_url in ASSETS["fontawesome_webfonts"]:
        webfont_filename = os.path.basename(webfont_url)
        webfont_path = webfonts_dir / webfont_filename
        
        if not webfont_path.exists():
            try:
                download_file(webfont_url, webfont_path)
            except Exception as e:
                logger.error(f"Failed to download webfont {webfont_filename}: {e}")
        else:
            logger.info(f"Webfont already exists at {webfont_path}")
    
    # Update index.html to use local assets
    update_index_html()
    
    logger.info("Assets download completed")

if __name__ == "__main__":
    download_assets()