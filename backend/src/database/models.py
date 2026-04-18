from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.database.connection import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    signup_date = Column(DateTime, server_default=func.now())
    country = Column(String)
    
    orders = relationship("Order", back_populates="user")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String)
    price = Column(Numeric(10, 2), nullable=False)
    stock = Column(Integer, server_default="0")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    order_date = Column(DateTime, server_default=func.now())
    status = Column(String)
    total_amount = Column(Numeric(10, 2), nullable=False)
    
    user = relationship("User", back_populates="orders")

class TableMetadata(Base):
    """Stores human-readable descriptions for each database table."""
    __tablename__ = "table_metadata"
    id = Column(Integer, primary_key=True, index=True)
    table_name = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
