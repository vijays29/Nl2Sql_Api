# Natural Language to SQL Query Generation API

## Problem Statement

In modern data environments, users often need to query complex databases without being familiar with SQL syntax. This can present a significant challenge, especially in enterprises using relational databases such as Oracle. Traditional SQL query writing requires a deep understanding of the database schema, table relationships, and query structure.

The **Natural Language to SQL Query Generation (NL2SQL) API** aims to solve this problem by providing a tool that allows users to generate SQL queries directly from natural language input. The API enables a seamless and intuitive way to interact with databases, empowering business users, analysts, and data scientists to query data without requiring SQL expertise.

## Application Overview

The NL2SQL API is designed to:

- Translate natural language queries into SQL `SELECT` statements.
- Provide strict schema validation to ensure queries are correctly constructed based on existing table and column names.
- Handle complex query logic such as filtering, aggregation, sorting, and joining tables.
- Prohibit unsupported operations, including data modification (DML/DDL), pagination, and unapproved queries.
- Ensure correct query formatting by outputting only valid SQL `SELECT` statements without extraneous text.

The system utilizes **Google Generative AI (Gemini model)** for processing natural language input and transforming it into SQL queries.

## Application Integration

The API is designed for integration with a frontend interface or any backend application that needs to convert user input into SQL queries. Below is a breakdown of how the components work together in an integrated system:

### 1. Frontend Integration

The frontend application (e.g., a web app or mobile app) sends natural language queries to the FastAPI backend through HTTP POST requests. The query is passed to the backend API’s `/data-requests` endpoint, where it is processed. The backend generates the appropriate SQL `SELECT` query based on the user’s request, which is returned to the frontend for displaying the results in a user-friendly format.

### 2. Backend Integration

The backend application (FastAPI) integrates with the Oracle database through a connection pool, initialized during the first request and closed when no longer needed. A schema metadata fetcher provides details about the tables and columns, ensuring that queries are constructed strictly based on available schema information.

Generated SQL queries are executed through the **OracleDB** class, which safely queries the database, handles the results, and returns them as JSON to the frontend.

## Key Components Overview

### 1. FastAPI Application

FastAPI is used to build the RESTful API. The application supports CORS to allow cross-origin requests from a local frontend (e.g., React running on port 3000). The endpoints include:

- `/data-requests/initialize`: Initializes the database connection pool.
- `/data-requests`: Accepts natural language queries, generates SQL, and returns query results.
- `/data-requests/shutdown`: Shuts down the database connection pool.

### 2. Schema Metadata

- **get_metadata**: A utility function that fetches the database schema, including the table and column names. This metadata is used to validate and build valid SQL queries.

### 3. OracleDB Class

Manages database connection pooling using `oracledb.SessionPool`. Handles the execution of SQL queries through `Execute_Query`, ensuring correct execution, result formatting, and error handling.

### 4. Google Generative AI (via LangChain)

Utilizes Google Generative AI to convert natural language input into valid SQL `SELECT` queries based on a detailed prompt template. The model is configured to output only valid SQL queries by enforcing a set of strict rules.

## API Endpoints

### 1. Initialize Connection
- **Endpoint**: `/data-requests/initialize`
- **Method**: `POST`
- **Description**: Initializes the database connection pool.
- **Request**: No request body is needed.
- **Response**:
    ```json
    {
      "message": "Connection initialized"
    }
    ```

### 2. Process Natural Language Query
- **Endpoint**: `/data-requests`
- **Method**: `POST`
- **Description**: Accepts a natural language query and returns a SQL `SELECT` query based on the user’s request.
- **Request Body**:
    ```json
    {
      "user_query": "your natural language query",
      "offset": 0,
      "limit": 10
    }
    ```
    - `user_query`: The natural language query provided by the user.
    - `offset`: The starting point for the query (for pagination, though pagination is prohibited in this system).
    - `limit`: The number of results to return (with a maximum of 10).

- **Response**:
    ```json
    {
      "Table_result": [
        { "column1": "value1", "column2": "value2", ... },
        { "column1": "value1", "column2": "value2", ... }
      ]
    }
    ```

    If no results are found:
    ```json
    {
      "Message": "No data found"
    }
    ```

    If an error occurs in query execution:
    ```json
    {
      "detail": "Internal server error: An unexpected error occurred."
    }
    ```

### 3. Shutdown Connection
- **Endpoint**: `/data-requests/shutdown`
- **Method**: `POST`
- **Description**: Shuts down the database connection pool.
- **Request**: No request body is needed.
- **Response**:
    ```json
    {
      "message": "Connection closed"
    }
    ```

## Error Handling

The API ensures robust error handling across different failure points:

- **500 Internal Server Error**: When there’s an issue with the SQL generation or database connection.
- **400 Bad Request**: When the provided query is invalid, empty, or violates SQL generation rules (e.g., using non-existent tables/columns, requesting unsupported operations like DML).
- **404 Not Found**: When no results are found for a given query.

All error responses include a clear message to help the client identify the problem and take corrective action.

## Security Considerations

1. **API Key**: An API key is required to use the service. The API key should be set in the environment variables (`API_KEY`).
2. **CORS**: The API is configured to only accept requests from `http://localhost:3000` for development purposes. In production, this should be restricted to the production domain.
3. **SQL Validation**: The system ensures that only valid SQL queries are generated and executed. Invalid queries are prevented by the Generative AI model’s strict validation rules.

## Conclusion

The **Natural Language to SQL API** is a powerful tool that empowers users to interact with databases using simple natural language queries. It simplifies complex SQL query writing and integrates seamlessly into both frontend and backend systems, reducing the need for deep technical knowledge in SQL while ensuring data security and integrity.
