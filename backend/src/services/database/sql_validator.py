import re
import sqlparse

def validate_sql_safety(sql: str) -> bool:
    """
    Validates a SQL string to strictly run SELECT statements.
    Rejects completely if malicious commands or multiple statements are found.
    """
    parsed = sqlparse.parse(sql)
    
    # 1. Reject multiple statements to prevent piggybacking
    if len(parsed) > 1:
        raise ValueError("Multiple SQL statements are not permitted. Only single SELECT queries allowed.")

    # If empty or only comments
    if not parsed:
        raise ValueError("Empty SQL execution is not permitted.")
        
    statement = parsed[0]
    
    # get_type() removes leading comments and whitespace automatically
    cmd_type = statement.get_type()
    
    if cmd_type != 'SELECT':
        raise ValueError(f"Safety verification failed. DML/DDL commands like '{cmd_type}' are strictly forbidden.")
        
    return True


