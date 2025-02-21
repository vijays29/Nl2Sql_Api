import os
import oracledb
from dotenv import load_dotenv
from fastapi import HTTPException
load_dotenv()

class OracleDB:
    def __init__(self):
        try:
            # Ensure all required environment variables are loaded
            db_user = os.getenv("DB_USER")
            db_pass = os.getenv("DB_PASS")
            db_host = os.getenv("DB_HOST")
            db_port = os.getenv("DB_PORT", "1521")
            db_service_name = os.getenv("DB_SERVICE_NAME")
            
            if not all([db_user, db_pass, db_host, db_service_name]):
                raise ValueError("Missing required environment variables.")
            
            self.pool = oracledb.SessionPool(
                user=db_user,
                password=db_pass,
                dsn=f"{db_host}:{db_port}/{db_service_name}",
                min=2,
                max=4,
                increment=1,
                threaded=True,
                encoding="UTF-8"
            )
        except (oracledb.DatabaseError, ValueError) as e:
            print(f"Database connection error: {e}")
            raise HTTPException(status_code=500, detail="Db error...")

    def fetch_table_details(self) -> dict:
        connection = None
        try:
            connection = self.pool.acquire()
            with connection.cursor() as cursor:
                # Modify query to fetch the specific tables
                cursor.execute(
                    "SELECT table_name FROM user_tables WHERE table_name IN ('LEAF_AND_SPINE_C93180YC_REPRT', 'CARD_SLOT_HIERARCHY_REPRT')"
                )
                tables = [row[0] for row in cursor.fetchall()]
                
                result = {}
                for table_name in tables:
                    cursor.execute(
                        "SELECT column_name, data_type FROM user_tab_columns WHERE table_name = :table_name",
                        {'table_name': table_name}
                    )
                    columns = {col[0]: col[1] for col in cursor.fetchall()}
                    result[table_name] = columns

                return {"tables_and_fields": result}

        except oracledb.DatabaseError as e:
            print(f"Database error: {e}")
            raise HTTPException(status_code=500, detail="Error fetching table details.")

        finally:
            if connection:
                print("Releasing the connection back to the pool...")
                self.pool.release(connection)

# Example usage
db_instance = OracleDB()
try:
    table_details = db_instance.fetch_table_details()
    print(table_details)
except HTTPException as e:
    print(f"HTTP error: {e.detail}")
