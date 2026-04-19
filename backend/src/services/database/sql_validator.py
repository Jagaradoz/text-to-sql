import re
import sqlparse

def validate_sql_safety(sql: str) -> bool:
    """
    Validates a SQL string to strictly run SELECT statements.
    Rejects completely if malicious commands or multiple statements are found.
    """
    # Strip leading/trailing whitespace and comments for type detection
    clean_sql = sql.strip()
    parsed = sqlparse.parse(clean_sql)
    
    # 1. Reject multiple statements to prevent piggybacking
    if len(parsed) > 1:
        raise ValueError("Multiple SQL statements are not permitted. Only single SELECT queries allowed.")

    # If empty or only comments
    if not parsed:
        raise ValueError("Empty SQL execution is not permitted.")
        
    statement = parsed[0]
    
    # get_type() removes leading comments and whitespace automatically
    cmd_type = statement.get_type()
    
    # If sqlparse is unsure (UNKNOWN), we do a fallback check for 'SELECT' at the start
    is_select = cmd_type == 'SELECT'
    if cmd_type == 'UNKNOWN':
        # Simple fallback for complex queries that sqlparse might not fully classify
        first_word = re.split(r'\s+', clean_sql.lstrip(), maxsplit=1)[0].upper()
        if first_word in ('SELECT', 'WITH'):
            is_select = True

    if not is_select:
        raise ValueError(f"Safety verification failed. DML/DDL commands like '{cmd_type}' are strictly forbidden.")
        
    return True


