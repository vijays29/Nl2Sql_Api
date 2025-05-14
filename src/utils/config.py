import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from src.utils.logger import get_logger

logger = get_logger("config")

load_dotenv(override=True)

class Settings(BaseSettings):
    """
    Settings class for loading and validating configuration values from environment variables.

    This class uses `pydantic`'s `BaseSettings` to handle the loading of configuration settings from 
    environment variables or `.env` file. It also includes validation to ensure required values are present.
    """

    API_KEY: str
    """API Key for accessing external services, required for authentication."""

    DB_USER: str
    """Database username used for authenticating with the Oracle database."""

    DB_PASS: str
    """Database password corresponding to the `DB_USER`."""

    DB_HOST: str
    """Hostname or IP address of the database server."""

    DB_PORT: str = "1521"
    """Port number used to connect to the Oracle database. Defaults to '1521'."""

    DB_SERVICE_NAME: str
    """Service name for the Oracle database instance."""

    DB_MIN_CONNECTIONS: int = 2
    """Minimum number of connections in the Oracle connection pool. Default is 2."""

    DB_MAX_CONNECTIONS: int = 5
    """Maximum number of connections in the Oracle connection pool. Default is 5."""

    DB_CONNECTION_INCREMENT: int = 1
    """Number of connections to add to the pool when more are needed. Default is 1."""

    PINECONE_API_KEY: str
    """Pinecone API key for rag model"""

    INDEX_NAME: str
    """Index_name for the stored metadata in the Pinecone"""

    @classmethod
    def validate(cls):
        """
        Validates that all required environment variables are present and correctly loaded.

        This method checks for the presence of critical environment variables needed for 
        the operation of the application. If any required environment variable is missing, 
        it logs an error message and raises a `ValueError` exception.

        Raises:
            ValueError: If any required environment variables are missing.
        """
        missing_vars = [var for var in ['API_KEY', 'DB_USER', 'DB_PASS', 'DB_HOST', 'DB_SERVICE_NAME','PINECONE_API_KEY','INDEX_NAME'] if not getattr(cls, var)]
        
        if missing_vars:
            logger.error(f"Missing required environment variables: {', '.join(missing_vars)}")
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        else:
            logger.info("All required environment variables are present.")

    class Config:
        """
        Configuration for pydantic's `BaseSettings` class to read from a `.env` file.

        The `env_file` attribute tells pydantic to look for configuration variables in 
        a `.env` file, and `extra = "allow"` allows extra configuration values that are not defined 
        as class attributes to be ignored.
        """
        env_file = ".env"
        extra = "allow"

settings = Settings()
logger.info("Settings object initialized successfully.")
