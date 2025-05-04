#!/usr/bin/env python3

import uvicorn
import argparse
import os

def main():
    parser = argparse.ArgumentParser(description="Redis Explorer Server")
    parser.add_argument("--host", default="localhost", help="Server host")
    parser.add_argument("--port", type=int, default=8005, help="Server port")
    
    args = parser.parse_args()
    
    # Check if client build exists
    client_build_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "client", "build")
    if not os.path.exists(client_build_dir):
        print("Warning: Client build directory not found. Please run 'npm run build' in the client directory.")
    
    print(f"Starting Redis Explorer server on http://{args.host}:{args.port}...")
    uvicorn.run("api:app", host=args.host, port=args.port, reload=True)

if __name__ == "__main__":
    main()