import os
from mysql.connector import pooling, Error
from dotenv import load_dotenv
from fastapi import HTTPException
# from src.utils.logger import get_logger

load_dotenv()
# logger = get_logger("Execution_Logger")

class MysqlDB:

    def __init__(self):
        self.pool = None
        self.initialize_pool()

    def initialize_pool(self):
        try:
            pool_size = int(os.getenv('POOL_SIZE', 5))
            self.pool = pooling.MySQLConnectionPool(
                pool_name="mysql_pool",
                pool_size=pool_size,
                pool_reset_session=True,
                host=os.getenv('HOST_NAME'),
                user=os.getenv('USER_NAME'),
                password=os.getenv('PASSWORD'),
                database=os.getenv('DATABASE_NAME'),
                connect_timeout=10,
            )
            # logger.info("MySQL connection pool initialized successfully.")
        except Error as e:
            # logger.error(f"MySQL connection pool initialization failed: {e}")
            raise HTTPException(status_code=500, detail="Unable to establish MySQL database connection.")

    def Execute_Query(self, sql_query: str, params=None) -> list[dict]:
        if not self.pool:
            # logger.error("Attempted to execute a query without an initialized MySQL connection pool.")
            raise HTTPException(status_code=500, detail="MySQL connection is not initialized.")

        connection = None

        try:
            connection = self.pool.get_connection()
            cursor = connection.cursor()
            cursor.execute(sql_query, params or ())
            columns = [col[0] for col in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]

            if not results:
                # logger.warning(f"No data found for query: {sql_query}")
                raise HTTPException(status_code=404, detail="No data found for the given query.")

            # logger.debug(f"Query executed successfully with {len(results)} rows returned.")
            return results

        except Error as e:
            # logger.error(f"MySQL error occurred during query execution: {e}")
            raise HTTPException(status_code=400, detail="Error executing the MySQL query.")

        except Exception as e:
            # logger.exception(f"Unexpected error while executing MySQL query: {sql_query}")
            raise HTTPException(status_code=500, detail="Internal server error during query execution.")

        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()
                # logger.info("MySQL connection released back to pool.")

    def close_pool(self):

        self.pool = None
        # logger.info("MySQL pool reference cleared (no explicit close method available).")
# db=MysqlDB()
# s=db.Execute_Query("select*from ACTIVATION_SCHEDULER_INFO")

