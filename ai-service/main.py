import os
import sys

# Ensure root of ai-service is in sys.path
sys.path.insert(0, os.path.dirname(__file__))

from app.main import app

# Expose app for Vercel / ASGI servers
__all__ = ["app"]

