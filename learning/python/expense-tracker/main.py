from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
import auth
from database import engine, get_db

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="JWT Expense Tracker API")

@app.post("/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.hash_password(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/expenses", response_model=schemas.ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense: schemas.ExpenseCreate, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    new_expense = models.Expense(**expense.model_dump(), user_id=current_user.id)
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@app.get("/expenses", response_model=List[schemas.ExpenseResponse])
def get_expenses(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # IDOR Vulnerability Protection:
    # Instead of fetching all expenses and relying on the client to filter,
    # or querying by an ID provided in the URL without checking ownership,
    # we enforce that the user ID on the expense matches the current authenticated user.
    # This prevents an Insecure Direct Object Reference (IDOR) attack where a user
    # tries to access resources belonging to someone else.
    expenses = db.query(models.Expense).filter(models.Expense.user_id == current_user.id).all()
    return expenses

@app.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # IDOR Protection check for delete
    # Ensures a user can only delete their own expense, not another user's expense
    if expense.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this expense")
    
    db.delete(expense)
    db.commit()
    return None
