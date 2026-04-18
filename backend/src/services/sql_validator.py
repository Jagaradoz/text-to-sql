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
