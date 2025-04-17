from src.utils.config import settings
import oracledb
from fastapi import HTTPException
from src.utils.logger import get_logger

logger = get_logger("Execution_Logger")

class OracleDB:
    def __init__(self):
        self.pool = None

    def initialize_pool(self):
        try:
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
            logger.error(f"Database connection error: {e}")
            raise HTTPException(status_code=500, detail="Unable to establish database connection.")

    def Execute_Query(self, sql_query: str, params=None)->list[dict]:
        if not self.pool:
            logger.error("Attempted to execute query without initializing connection pool.")
            raise HTTPException(status_code=500, detail="Database connection is not initialized.")
        
        connection = None
        try:
            connection = self.pool.acquire()
            with connection.cursor() as cursor:
                cursor.execute(sql_query)
                columns = [col[0] for col in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]
                if not results:
                    logger.info(f"Query returned no results: {sql_query}")
                    return []
                logger.debug(f"Query executed successfully and returned {len(results)} rows.")
                return results
        except oracledb.DatabaseError as e:
            logger.error(f"Database error during query execution: {e}")
            raise HTTPException(status_code=400, detail="Error executing the query")
        except Exception as e:
            logger.exception(f"Unexpected error while executing query: {sql_query}")
            raise HTTPException(status_code=500, detail="Internal server error during query execution.")
        finally:
            if connection:
                self.pool.release(connection)
                logger.info("Database connection released back to pool.")

    def close_pool(self):
        if self.pool:
            self.pool.close()
            self.pool = None
            logger.info("Database connection pool closed.")
