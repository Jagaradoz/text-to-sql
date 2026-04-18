from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker, declarative_base
from src.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_db_schema():
    """
    Introspects the database using SQLAlchemy and returns a list of tables,
    their columns, and relationships.
    """
    inspector = inspect(engine)
    schema_info = []
    
    for table_name in inspector.get_table_names():
        columns = []
        for column in inspector.get_columns(table_name):
            columns.append({
                "name": column["name"],
                "type": str(column["type"]),
                "nullable": column["nullable"],
            })
        
        # Get foreign keys
        foreign_keys = []
        for fk in inspector.get_foreign_keys(table_name):
            foreign_keys.append({
                "constrained_columns": fk["constrained_columns"],
                "referred_table": fk["referred_table"],
                "referred_columns": fk["referred_columns"]
            })
            
        schema_info.append({
            "table_name": table_name,
            "columns": columns,
            "foreign_keys": foreign_keys
        })
        
    return schema_info
