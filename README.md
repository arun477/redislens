# Redis Lens

Redis Lens is a Simple, beautiful Redis monitoring and management tool with a clean interface built using React and FastAPI. It allows you to connect to Redis servers, explore keys, execute commands, and monitor server performance.


| Key Explorer                   | Performance Monitor                 | Command Runner            |
|--------------------------------|--------------------------------|--------------------------------|
| ![key explorer](https://github.com/user-attachments/assets/05cb5fc0-dfb1-4d0d-9967-66e790950884) | ![command runner](https://github.com/user-attachments/assets/eda993b5-76d6-47e8-80bc-403628e5e5f1) | ![performance monitor](https://github.com/user-attachments/assets/94c55555-563d-4321-8f48-17e786206c29) |

| Edit Keys           | Connection Manager             |                                |
|--------------------------------|--------------------------------|--------------------------------|
| ![charts and metrics](https://github.com/user-attachments/assets/9a514a3b-d381-4fe3-8961-9a5c5e36b48f) | ![connection manager](https://github.com/user-attachments/assets/076ec4f7-035b-4c2e-b219-02481a1a6b29) |                                |








## Features

- 🔍 **Key Explorer**: Browse, search, and manage Redis keys with pagination
- 🖥️ **Command Terminal**: Execute any Redis command with a built-in command history
- 📊 **Server Dashboard**: Monitor Redis server performance metrics with real-time charts
- 🌓 **Dark/Light Mode**: Eye-friendly interface that works in any lighting condition
- 🚀 **Offline Mode**: Works without internet connection by bundling all required assets

## Installation

Redis Lens can be installed via pip:

```bash
pip install redislens
```

## Usage

Start Redis Lens with a simple command:

```bash
redislens
```

This will start the server on http://localhost:8005 and automatically open it in your default web browser.

### Command-Line Options

```bash
# Start on a different host/port
redislens start --host 0.0.0.0 --port 8080

# Do not open the browser automatically
redislens start --no-browser

# Run in debug mode (auto-reload on code changes)
redislens start --debug

# Show version information
redislens version
```

## Development

To set up a development environment:

1. Clone the repository:
   ```bash
   git clone https://github.com/arun477/redislens.git
   cd redislens
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install in development mode:
   ```bash
   pip install -e .
   ```

4. Run with debug mode:
   ```bash
   redislens start --debug
   ```

## Building the Frontend

The frontend is a React application. To build it:

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the production version:
   ```bash
   npm run build
   ```

4. Copy the build directory to the package:
   ```bash
   cp -r build ../redis_lens/
   ```

## License

MIT License - See LICENSE file for details.

## Acknowledgements

- Thanks to the Redis team for creating an amazing in-memory database
- React, FastAPI, Tailwind CSS, and other open-source libraries that made this project possible
