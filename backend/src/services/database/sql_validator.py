import re
import sqlparse
from sqlparse.tokens import DML, DDL

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
    
    # 2. Strict DML/DDL token check (prevents CTE bypass)
    forbidden_keywords = {
        'INSERT', 'UPDATE', 'DELETE', 'REPLACE', 'MERGE', 'DROP', 
        'ALTER', 'TRUNCATE', 'GRANT', 'REVOKE', 'COMMIT', 'ROLLBACK', 
        'EXEC', 'EXECUTE', 'CALL'
    }
    
    for token in statement.flatten():
        if token.is_keyword or token.ttype in (DML, DDL):
            if str(token.value).upper() in forbidden_keywords:
                raise ValueError(f"Safety verification failed. Forbidden command '{str(token.value).upper()}' detected.")
    
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


