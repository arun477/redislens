from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

package_data = {
    "redis_lens": [
        "build/**/*",
        "static/**/*",
    ],
}

setup(
    name="redis-lens",
    version="0.1.0",
    author="arun477",
    author_email="arunarumugam411@gmail.com",
    description="Simple Redis monitoring and management tool",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/arun477/redislens",
    packages=find_packages(),
    package_data=package_data,
    include_package_data=True,
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.7",
    install_requires=[
        "fastapi>=0.95.0",
        "uvicorn>=0.21.0",
        "redis>=4.5.4",
        "requests>=2.28.0",
        "typer>=0.9.0",
    ],
    entry_points={
        "console_scripts": [
            "redis-lens=redis_lens.cli:main",
        ],
    },
)