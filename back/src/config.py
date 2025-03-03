import os


# JWT
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-for-development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Postgres
POSTGRES_USER = os.environ.get('POSTGRES_USER', 'postgres')
POSTGRES_PASSWORD = os.environ.get('POSTGRES_PASSWORD', 'postgres')
POSTGRES_HOST = os.environ.get('POSTGRES_HOST', 'localhost')
POSTGRES_PORT = os.environ.get('POSTGRES_PORT', '5432')
POSTGRES_DB = os.environ.get('POSTGRES_DB', 'app')
CONNECTION_STRING = f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

# GEMINI API
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', 'sk-9c33e1ecb15640c8b060fe63eeaea71c')

# Redis
REDIS_HOST = os.environ.get('REDIS_HOST', 'localhost')
REDIS_PORT = os.environ.get('REDIS_PORT', '6379')
REDIS_CACHE_TTL = int(os.environ.get('REDIS_CACHE_TTL', '3600'))  # Time in seconds (1 hour default)

# Roles
class Roles:
    ADMIN = "admin"
    USER = "user"
    MENTOR = "mentor"