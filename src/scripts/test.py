import asyncio
import re
from src.utils.config import settings
import google.generativeai as Aimodel
from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from fastapi import HTTPException
from src.utils.logger import get_logger
from google.api_core.exceptions import ResourceExhausted
from Nl2Sql_Api.src.utils.retriever import semantic_search

logger = get_logger("Nl2Sql_Logger")

API_KEY = settings.API_KEY

if not API_KEY:
    logger.error("Missing API_KEY in environment variables.")
    raise HTTPException(status_code=500, detail="API_KEY is missing. Set it in the environment variables.")

Aimodel.configure(api_key=API_KEY)

def clean_sql_query(query: str) -> str:
    query_cleaned = re.sub(r'`|sql', '', query, flags=re.IGNORECASE)
    return query_cleaned.strip()

def clean_rag_text(text: str) -> str:
    cleaned = text.strip().replace('\\n', '\n').replace('\n\n', '\n')
    lines = cleaned.splitlines()
    formatted_lines = [f"  {line}" if line.startswith('-') else line.strip() for line in lines]
    return '\n'.join(formatted_lines)

async def get_schema_context_from_rag(query: str) -> str:
    results = await asyncio.to_thread(semantic_search, query)
    combined = "\n".join(
        clean_rag_text(item['text']) for item in results if 'text' in item
    )
    if not combined.strip():
        logger.warning("No RAG schema context retrieved.")
        raise HTTPException(status_code=500, detail="Schema metadata unavailable from RAG.")
    return combined

async def Convert_Natural_Language_To_Sql(user_query: str) -> str | None:
    try:
        schema_context = await get_schema_context_from_rag(user_query)
        prompt_template = PromptTemplate(
            input_variables=["user_query", "schema_context"],
            template="""
            You are a highly skilled SQL query generation tool designed for Oracle enterprise database environments. 
            Your sole function is to translate natural language requests into valid and efficient SQL SELECT statements. 
            Adhere strictly to the following rules, and respond ONLY with the generated SQL query.
            Any deviation from these rules will result in an error.

            **Mandatory Rules:**

            1. **SELECT-Only Operations:**
            * Your output MUST be a valid SQL SELECT statement, and ONLY a SELECT statement.
            * Any request implying data modification (DML, DDL, TCL, DCL) should result in the immediate response: `"ERROR"`.

            2. **Explicit Column Specification & Handling 'All Tables' Requests:**  
            * If the user specifies column names, include only those columns in the `SELECT` statement.  
            * If the user requests "all columns," "all data," or does not specify columns, use `SELECT *`. 
            * If the user requests "all tables,return `"ERROR" 
            * If no tables exist, return `"ERROR"`.

            3. **Schema Adherence & Validation:**  
            * Use only table and column names provided in the schema.  
            * If the user requests a non-existent table or column, return `"ERROR"`.

            4. **Handling Columns Appearing in Multiple Tables:**
            * If a column exists in multiple tables, return a `UNION ALL` query selecting that column from each table.
            * The result should include a new column indicating the source table name.
        
            5. **Precise Filtering & Conditions:**
            * Translate all WHERE clause conditions precisely as stated.
            * Ensure accurate handling of date ranges (using appropriate date/time functions if needed), numerical comparisons, and string matching (using LIKE or other relevant functions as needed).

            6. **Aggregation and Ordering Implementation:**
            * Correctly implement requested aggregation functions (COUNT) only.
            * Implement ORDER BY clauses exactly as requested, including the specified column(s) and sort order (ASC or DESC). Default to ASC if not specified.

            7. **Pagination is Strictly Prohibited (LIMIT, OFFSET, FETCH):**
            * Your output MUST NOT include:
                * `LIMIT`
                * `OFFSET`
                * `FETCH NEXT … ROWS ONLY`
            * If a user requests any form of pagination, return `"ERROR"`

            8. **Zero Tolerance for Additional Text:**
            * Your output consists SOLELY of the generated SQL SELECT statement. Do NOT include any explanations, comments, or introductory text. Failure to adhere to this is an error.

            9. **Assume Correct Grammar:**
            * Assume that the user input is grammatically correct, though it might contain synonyms or multiple ways to ask the same question.

            **Process:**

            1. Receive a natural language request.
            2. Parse the request to identify:
            * The target table(s).
            * The desired columns.
            * Any filtering conditions (WHERE clause).
            * Any aggregation requirements.
            * Any sorting requirements (ORDER BY clause).
            * Any LIMIT/OFFSET requirements (which MUST NOT be included in the query).
            3. Construct a valid SQL SELECT statement that fulfills all requirements.
            4. If a requested column appears in multiple tables, construct a `UNION ALL` query with a `source_table` column..
            5. If the user asks for data from **both tables with a relationship**, construct an appropriate `JOIN` query.
            6. Output ONLY the SQL SELECT statement. If any rule is violated, output `"ERROR"`.
            
            Schema:Generated SQL:
            {schema_context}

            Now convert the following Natural Language Query:
            {user_query}""")
        
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            api_key=API_KEY,
            temperature=0
        )

        chain = (
            {"user_query": RunnablePassthrough(), "schema_context": RunnableLambda(lambda _: schema_context)}
            | prompt_template
            | llm
            | RunnableLambda(lambda x: x.content)
        )

        sql_query = await asyncio.to_thread(chain.invoke, user_query)
        sql_query = clean_sql_query(sql_query)

        if sql_query.endswith(';'):
            sql_query = sql_query[:-1]
            logger.info("Removed semicolon from generated SQL.")

        if "ERROR" in sql_query or not sql_query.lower().startswith("select"):
            logger.warning(f"Invalid SQL generated: {sql_query}")
            raise HTTPException(status_code=400, detail="Failed to process input into valid SQL.")
        return sql_query
    
    except ResourceExhausted:
        logger.error(f"Quota exceeded for query: {user_query}")
        return None

    except Exception as e:
        logger.exception(f"SQL generation failed: {e}")
        raise HTTPException(status_code=500, detail="SQL generation failed.")

async def test_run():
    test_query = "i want drop all data from CARD_SLOT_HIERARCHY_REPRT"
    sql = await Convert_Natural_Language_To_Sql(test_query)
    print("\nGenerated SQL:\n", sql)

if __name__ == "__main__":
    asyncio.run(test_run())