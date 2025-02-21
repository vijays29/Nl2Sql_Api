from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from src.utils.logger import get_logger

logger = get_logger(__name__)

load_dotenv()

class Settings(BaseSettings):
    API_KEY: str
    DB_USER: str
    DB_PASS: str
    DB_HOST: str
    DB_PORT: str = "1521"
    DB_SERVICE_NAME: str
    
    DB_MIN_CONNECTIONS: int = 2
    DB_MAX_CONNECTIONS: int = 5
    DB_CONNECTION_INCREMENT: int = 1

    @classmethod
    def validate(cls):
        """
        Validates that required configuration values are present.
        Logs missing configurations and raises an exception if any required env var is missing.
        """
        missing_vars = [var for var in ['API_KEY', 'DB_USER', 'DB_PASS', 'DB_HOST', 'DB_SERVICE_NAME'] if not getattr(cls, var)]
        
        if missing_vars:
            logger.error(f"Missing required environment variables: {', '.join(missing_vars)}")
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        else:
            logger.info("All required environment variables are present.")

    class Config:
        env_file = ".env"
        extra = "allow" 

settings = Settings()
logger.info("Settings object initialized successfully.")