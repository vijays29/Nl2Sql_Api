from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from src.nl2sql_converter import Convert_Natural_Language_To_Sql
from src.query_executer import OracleDB
from src.utils.logger import get_logger
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Initialize logger instance for tracking events and errors
logger = get_logger("API_Logger")

# Initialize OracleDB instance (connection pool will be initialized later)
db_instance = OracleDB()

# Create FastAPI application instance
app = FastAPI()

# Configure Cross-Origin Resource Sharing (CORS) settings
# Note: Update `allow_origins` appropriately before deploying to production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Only allow local frontend in development
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.post("/data-requests/initialize")
async def initialize_connection():
    """
    API Endpoint: Initialize database connection pool.

    This should be triggered by the frontend once the application starts,
    ensuring that a connection pool is ready for executing queries.
    """
    try:
        db_instance.initialize_pool()
        logger.info("Frontend initialized the database connection.")
        return JSONResponse(content={"message": "Connection initialized"}, status_code=200)
    except HTTPException as e:
        raise e
    except Exception:
        logger.exception("Error occurred while initializing database connection.")
        raise HTTPException(status_code=500, detail="Failed to initialize database connection.")

class NlQueryRequest(BaseModel):
    """
    Request model for processing natural language queries.

    Attributes:
        user_query (str): The natural language query provided by the user.
        offset (int): Pagination offset for result slicing. Defaults to 0.
        limit (int): Maximum number of records to return. Defaults to 10.
    """
    user_query: str
    offset: int = 0
    limit: int = 10

# Define the maximum limit per request to prevent heavy database load
MAX_LIMIT = 10

@app.post("/data-requests")
async def process_request(request: NlQueryRequest):
    """
    API Endpoint: Process a natural language query and return database results.

    Steps:
    1. Validate input query.
    2. Convert natural language to SQL using the conversion utility.
    3. Apply pagination unless the query contains an aggregate function.
    4. Execute the generated SQL.
    5. Return results as JSON.

    Returns:
        - 200 OK with query results.
        - 400 Bad Request if input is invalid.
        - 404 Not Found if no data matches the query.
        - 500 Internal Server Error if unexpected issues occur.
    """
    # Debugging: print incoming request details
    print(request.user_query, request.offset, request.limit)

    user_query = request.user_query.strip()
    requested_limit = min(request.limit, MAX_LIMIT)  # Enforce maximum result limit

    # Validate that the input query is not empty
    if not user_query:
        logger.warning("Received an empty query request.")
        raise HTTPException(status_code=400, detail="Query cannot be empty. Please enter a valid query.")

    # Step 1: Convert natural language to SQL
    generated_sql = Convert_Natural_Language_To_Sql(user_query)

    if not generated_sql:
        logger.warning(f"Failed to generate SQL for query: {user_query}")
        raise HTTPException(status_code=400, detail="Failed to process the input query into a valid SQL statement.")

    logger.info(f"Generated SQL query: {generated_sql}")

    # Step 2: Check for aggregate functions in SQL (pagination not applied if aggregates are present)
    AGGREGATE_KEYWORDS = ["COUNT", "AVG", "SUM", "MIN", "MAX", "TOTAL"]
    has_aggregate = any(keyword in generated_sql.upper() for keyword in AGGREGATE_KEYWORDS)

    # Step 3: Apply pagination if no aggregation detected
    if has_aggregate:
        sql_query = generated_sql
    else:
        sql_query = f"""
            SELECT * FROM (
                SELECT a.*, ROWNUM rnum FROM ({generated_sql}) a WHERE ROWNUM <= {request.offset + requested_limit}
            )
            WHERE rnum > {request.offset}
        """
        # Debugging: print the final paginated query
        print(sql_query)

    try:
        # Step 4: Execute SQL query
        query_result = db_instance.Execute_Query(sql_query)

        # Step 5: Return results
        if query_result:
            logger.info("Successfully fetched and sent query results.")
            return JSONResponse(content={"Table_result": query_result}, status_code=200)
        else:
            logger.info("No data found for the given query.")
            return JSONResponse(content={"Message": "No data found"}, status_code=404)

    except HTTPException as e:
        logger.error(f"HTTP Exception during query execution: {e.detail}")
        raise HTTPException(
            status_code=e.status_code,
            detail=f"HTTP error occurred: {e.detail}. Please check your request and try again."
        )
    except Exception:
        logger.exception("Unexpected error occurred during query execution.")
        raise HTTPException(status_code=500, detail="Internal server error: An unexpected error occurred.")

@app.post("/data-requests/shutdown")
async def shutdown_connection():
    """
    API Endpoint: Gracefully shutdown the database connection pool.

    This should be called when the frontend or client application is being closed
    to ensure that the connection pool is properly released.
    """
    db_instance.close_pool()
    logger.info("Frontend triggered the shutdown of database connections.")
    return JSONResponse(content={"message": "Connection closed"}, status_code=200)

if __name__ == "__main__":
    # Entry point: Run the FastAPI application using Uvicorn ASGI server
    uvicorn.run(app, host="0.0.0.0", port=8000)
