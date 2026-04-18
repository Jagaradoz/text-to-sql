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


def validate_ddl_safety(sql: str) -> bool:
    """
    Validates an uploaded SQL script to ensure it only performs 
    safe Schema modifications (CREATE, ALTER) or Data insertions (INSERT).
    REJECTS destructive actions like DROP DATABASE or TRUNCATE.
    """
    parsed = sqlparse.parse(sql)
    
    # We allow multiple statements for schema creation scripts
    if not parsed:
        raise ValueError("SQL script is empty.")

    allowed_types = {"CREATE", "ALTER", "INSERT", "COMMENT"}
    forbidden_types = {"DROP", "DELETE", "TRUNCATE", "UPDATE"}

    for statement in parsed:
        # Check if the statement is purely whitespace/comments
        is_empty_or_comment = True
        for token in statement.flatten():
            ttype_str = str(token.ttype)
            if not ttype_str.startswith("Token.Text.Whitespace") and not ttype_str.startswith("Token.Comment"):
                is_empty_or_comment = False
                break
        
        if is_empty_or_comment:
            continue

        cmd_type = statement.get_type()
        
        # Check for forbidden keywords in actual tokens (ignoring strings/comments)
        for token in statement.flatten():
            ttype_str = str(token.ttype)
            if ttype_str.startswith("Token.Literal.String") or ttype_str.startswith("Token.Comment"):
                continue
            if token.value.upper() in forbidden_types:
                raise ValueError(
                    "Safety verification failed. Destructive commands are strictly forbidden in this showcase system."
                )

        if cmd_type and cmd_type not in allowed_types:
            raise ValueError(
                f"Safety verification failed. Command type '{cmd_type}' is not allowed in schema uploads."
            )
            
    return True
