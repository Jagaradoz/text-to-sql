import sqlparse
from fastapi import HTTPException

def validate_sql_safety(sql: str) -> bool:
    """
    Validates a SQL string to strictly run SELECT statements.
    Rejects completely if malicious commands or multiple statements are found.
    """
    parsed = sqlparse.parse(sql)
    
    # 1. Reject multiple statements to prevent piggybacking
    if len(parsed) > 1:
        raise HTTPException(
            status_code=400, 
            detail="Multiple SQL statements are not permitted. Only single SELECT queries allowed."
        )

    # If empty or only comments
    if not parsed:
        raise HTTPException(status_code=400, detail="Empty SQL execution is not permitted.")
        
    statement = parsed[0]
    
    # get_type() removes leading comments and whitespace automatically
    cmd_type = statement.get_type()
    
    if cmd_type != 'SELECT':
        raise HTTPException(
            status_code=400, 
            detail=f"Safety verification failed. DML/DDL commands like '{cmd_type}' are strictly forbidden."
        )
        
    return True


def validate_ddl_safety(sql: str) -> bool:
    """
    Validates an uploaded SQL script to ensure it only performs 
    safe Schema modifications (CREATE, ALTER) or Data insertions (INSERT).
    REJECTS destructive actions like DROP DATABASE or TRUNCATE.
    """
    parsed = sqlparse.parse(sql)
    
    # We allow multiple statements for schema creation scripts
    if not parsed:
        raise HTTPException(status_code=400, detail="SQL script is empty.")

    allowed_types = {"CREATE", "ALTER", "INSERT", "COMMENT"}
    forbidden_types = {"DROP", "DELETE", "TRUNCATE", "UPDATE"}

    for statement in parsed:
        cmd_type = statement.get_type()
        
        # We also want to check for keyword-based forbidden actions (like DROP TABLE)
        # because get_type() might not catch everything in a complex script
        query_upper = statement.value.upper()
        
        # Simple safety check: check for dangerous keywords in the query
        # But we allow CREATE/ALTER so we must be careful with DROP
        if any(f" {forbidden} " in f" {query_upper} " for forbidden in forbidden_types):
             raise HTTPException(
                status_code=400, 
                detail=f"Safety verification failed. Destructive commands are strictly forbidden in this showcase system."
            )

        if cmd_type and cmd_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Safety verification failed. Command type '{cmd_type}' is not allowed in schema uploads."
            )
            
    return True
