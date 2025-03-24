from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from contextlib import asynccontextmanager
from src.nl2sql_converter import Convert_Natural_Language_To_Sql
from src.query_exe import db_instance,Db_Output_Gen
from src.utils.logger import get_logger

logger=get_logger("API_Logger")

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     logger.info("Starting up...")
#     yield
#     db_instance.close_pool()
#     logger.info("Shutdown complete, connection pool closed.")

app=FastAPI()

class NlQueryRequest(BaseModel):
    user_query:str
    offset:int=0
    limit:int=10

MAX_LIMIT = 15
@app.post("/data-requests")
async def process_request(request:NlQueryRequest):

    user_query=request.user_query.strip()
    requested_limit = min(request.limit, MAX_LIMIT)

    if not user_query:
        logger.warning("Received an empty query request.")
        raise HTTPException(status_code=400,detail="Query cannot be empty.Please enter a valid query.")
    
    generated_sql=Convert_Natural_Language_To_Sql(user_query)

    print(generated_sql)

    if not generated_sql:
        logger.warning(f"Failed to generate SQL for query: {user_query}")
        raise HTTPException(status_code=400,detail="Invalid SQL query or unauthorized modifications detected.")
    
    logger.info(f"Generated SQL query: {generated_sql}")
    if any(keyword in generated_sql for keyword in ["COUNT", "AVG", "SUM", "MIN", "MAX", "TOTAL","WHERE"]):
        sql_query= generated_sql
    else:
        sql_query = f"""
         {generated_sql}
        LIMIT {requested_limit} OFFSET {request.offset}"""
    print(sql_query)

    try:
        query_result=Db_Output_Gen(sql_query)
        if query_result:
            logger.info("The JSON data Sended")
            return JSONResponse(content={"Table_result":query_result},status_code=200)
        else:
            return JSONResponse(content={"Message":"No data found"},status_code=404)

    except HTTPException as e:
        logger.error(f"HTTP Exception: {e.detail}")
        raise HTTPException(
            status_code=e.status_code,
            detail=f"HTTP error occurred: {e.detail}. Please check your request and try again.")
    except Exception as e:
        logger.exception("Unexpected error during query execution.")
        raise HTTPException(status_code=500,detail="Internal server error: An unexpected error occurred while processing your request.")