from src.utils.config import settings
import oracledb
from fastapi import HTTPException
from src.utils.logger import get_logger

# Initialize logger for database execution activities
logger = get_logger("Execution_Logger")

class OracleDB:
    """
    OracleDB manages Oracle database connections using a connection pool
    and provides methods to execute SQL queries safely and efficiently.
    """

    def __init__(self):
        """
        Initialize OracleDB instance.

        Attributes:
            pool (oracledb.SessionPool | None): 
                Placeholder for the Oracle connection pool instance. 
                Initially set to None and initialized via `initialize_pool()`.
        """
        self.pool = None

    def initialize_pool(self):
        """
        Create and initialize a new Oracle database connection pool.

        Raises:
            HTTPException: If unable to establish a database connection.
        """
        try:
            # Create a threaded session pool for concurrent access
            self.pool = oracledb.SessionPool(
                user=settings.DB_USER,
                password=settings.DB_PASS,
                dsn=f"{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_SERVICE_NAME}",
                min=settings.DB_MIN_CONNECTIONS,
                max=settings.DB_MAX_CONNECTIONS,
                increment=settings.DB_CONNECTION_INCREMENT,
                threaded=True,
                encoding="UTF-8"
            )
            logger.info("Database connection pool initialized successfully.")
        except (oracledb.DatabaseError, ValueError) as e:
            logger.error(f"Database connection error during pool initialization: {e}")
            raise HTTPException(status_code=500, detail="Unable to establish database connection.")

    def Execute_Query(self, sql_query: str, params=None) -> list[dict]:
        """
        Execute a SQL query using a pooled Oracle database connection 
        and return the results mapped as a list of dictionaries.

        Args:
            sql_query (str): 
                The SQL query string to execute. Must be a valid SELECT statement.
            params (any, optional): 
                Placeholder for query parameters (currently not utilized).

        Returns:
            list[dict]: 
                List of results where each row is represented as a dictionary 
                with column names as keys.

        Raises:
            HTTPException: 
                - 500 if the connection pool is not initialized.
                - 400 if a database-specific error occurs.
                - 500 if any unexpected internal error occurs.
        """
        if not self.pool:
            logger.error("Attempted to execute a query without an initialized connection pool.")
            raise HTTPException(status_code=500, detail="Database connection is not initialized.")

        connection = None
        try:
            # Acquire a connection from the pool
            connection = self.pool.acquire()
            with connection.cursor() as cursor:
                # Execute the provided SQL query
                cursor.execute(sql_query)

                # Extract column names from cursor description
                columns = [col[0] for col in cursor.description]

                # Fetch all rows and map each row into a dictionary
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]

                if not results:
                    logger.info(f"Query executed but returned no results: {sql_query}")
                    return []

                logger.debug(f"Query executed successfully with {len(results)} rows returned.")
                return results

        except oracledb.DatabaseError as e:
            logger.error(f"Database error occurred during query execution: {e}")
            raise HTTPException(status_code=400, detail="Error executing the database query.")
        except Exception as e:
            logger.exception(f"Unexpected error while executing query: {sql_query}")
            raise HTTPException(status_code=500, detail="Internal server error during query execution.")
        finally:
            # Ensure connection is always returned to the pool
            if connection:
                self.pool.release(connection)
                logger.info("Database connection released back to pool.")

    def close_pool(self):
        """
        Safely close and clean up the Oracle database connection pool.

        Notes:
            This should be called when the application is shutting down 
            or when database access is no longer required.
        """
        if self.pool:
            self.pool.close()
            self.pool = None
            logger.info("Database connection pool closed successfully.")
