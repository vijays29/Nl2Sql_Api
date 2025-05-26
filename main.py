from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from Nl2Sql_Api.src.scripts.nl2sql_converter import Convert_Natural_Language_To_Sql
#from src.oracle_executer import OracleDB
from Nl2Sql_Api.src.scripts.mysql_executer import MysqlDB
from src.utils.keywords import Contains_Forbidden_Keywords
from src.utils.logger import get_logger
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from fastapi.encoders import jsonable_encoder
logger = get_logger("API_Logger")
# db_instance = OracleDB()
db_instance = MysqlDB()
app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["POST"],
#     allow_headers=["*"],
# )

# @app.post("/data-requests/initialize")
# async def initialize_connection():
#     try:
#         db_instance.initialize_pool()
#         logger.info("Frontend initialized the database connection.")
#         return JSONResponse(content={"message": "Connection initialized"}, status_code=200,headers={"X-Custom-Header": "Connection-Initialized"})
#     except HTTPException as e:
#         raise e
#     except Exception:
#         logger.exception("Error occurred while initializing database connection.")
#         raise HTTPException(status_code=500, detail="Failed to initialize database connection.")

class NlQueryRequest(BaseModel):
    user_query: str
    offset: int = 0
    limit: int = 10

MAX_LIMIT = 10
AGGREGATE_KEYWORDS = ["COUNT", "AVG", "SUM", "MIN", "MAX", "TOTAL"]

def format_sql_query(generated_sql: str, offset: int, limit: int) -> str:
    if any(keyword in generated_sql.upper() for keyword in AGGREGATE_KEYWORDS):
        return generated_sql
    return f"""
        SELECT * FROM (
            SELECT a.*, ROWNUM rnum FROM ({generated_sql}) a WHERE ROWNUM <= {offset + limit}
        )
        WHERE rnum > {offset}
    """

@app.post("/data-requests")
async def process_request(request: NlQueryRequest):

    user_query = request.user_query.strip()
    requested_limit = min(request.limit, MAX_LIMIT)

    if Contains_Forbidden_Keywords(user_query):
        raise HTTPException(status_code=400,detail="Your query contains restricted terms related to database modifications, which are not allowed.")

    if not user_query:
        logger.warning("Received an empty query request.")
        raise HTTPException(status_code=400, detail="Query cannot be empty. Please enter a valid query.")

    generated_sql = await Convert_Natural_Language_To_Sql(user_query)

    if not generated_sql:
        logger.warning(f"Failed to generate SQL for query: {user_query}")
        raise HTTPException(status_code=400, detail="Quota exceeded. Please check your plan and billing details.")

    logger.info(f"Generated SQL query: {generated_sql}")

    if any(keyword in generated_sql.upper() for keyword in AGGREGATE_KEYWORDS):
        sql_query = generated_sql
    else:
        sql_query = "{} LIMIT {} OFFSET {}".format(generated_sql, requested_limit, request.offset)

        # sql_query = f"""
        #     SELECT * FROM (
        #         SELECT a.*, ROWNUM rnum FROM ({generated_sql}) a WHERE ROWNUM <= {request.offset + requested_limit}
        #     )
        #     WHERE rnum > {request.offset}
        # """
        # sql_query = format_sql_query(generated_sql, request.offset, requested_limit)
    query_result = db_instance.Execute_Query(sql_query)
    logger.info("Successfully fetched and sent query results.")
    # return JSONResponse(content={"Table_result": query_result}, status_code=200,headers={"X-Custom-Header": "Query-Success"})
    return jsonable_encoder(query_result)

# @app.post("/data-requests/shutdown")
# async def shutdown_connection():
#     db_instance.close_pool()
#     logger.info("Frontend triggered the shutdown of database connections.")
#     return JSONResponse(content={"message": "Connection closed"}, status_code=200,headers={"X-Custom-Header": "Connection-Closed"})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)