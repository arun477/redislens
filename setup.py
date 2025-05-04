from setuptools import setup, find_packages
import os
import re

# Read version without importing
with open(os.path.join("redislens", "version.py"), "r") as f:
    version_content = f.read()
    version_match = re.search(r'__version__ = "([^"]+)"', version_content)
    version = version_match.group(1) if version_match else "0.0.0"

# Read long description from README
with open("README.md", "r", encoding="utf-8") as f:
    long_description = f.read()

setup(
    name="redislens",
    version=version,
    description="Redis Lens",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="arun477",
    author_email="arunarumugam411@gmail.com",
    url="https://github.com/arun477/redislens",
    license="MIT",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "fastapi>=0.95.0",
        "uvicorn>=0.22.0",
        "redis>=4.5.4",
        "pydantic>=1.10.7",
    ],
    entry_points={
        "console_scripts": [
            "redislens=redislens.cli:main",
        ],
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Environment :: Web Environment",
        "Framework :: FastAPI",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Database",
        "Topic :: Utilities",
    ],
    python_requires=">=3.8",
    keywords="redis, gui, admin, monitoring, database",
)