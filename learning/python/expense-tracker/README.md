# JWT-Authenticated Expense Tracker API

## Overview
This is a secure, RESTful API for tracking personal expenses. It allows users to register, authenticate, and manage their expenses. Every expense is tied to the authenticated user, preventing unauthorized access to other users' data.

## Architecture
- **Web Framework:** FastAPI (Python)
- **Database ORM:** SQLAlchemy
- **Database:** SQLite (local development)
- **Authentication:** JWT (JSON Web Tokens) with OAuth2 Password Bearer flow
- **Password Hashing:** passlib using `bcrypt`

## How to Run

1. **Install dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```
2. **Start the development server:**
   ```powershell
   uvicorn main:app --reload
   ```
3. **Run Tests:**
   ```powershell
   pytest test_api.py -v
   ```

## API Endpoints

| Method | Endpoint | Protection | Description |
|--------|----------|------------|-------------|
| POST | `/signup` | Open | Create a new user account |
| POST | `/login` | Open | Authenticate user and receive JWT |
| POST | `/expenses`| JWT Auth | Create an expense for the authenticated user |
| GET | `/expenses`| JWT Auth | List all expenses belonging to the authenticated user |
| DELETE | `/expenses/{id}` | JWT Auth | Delete a specific expense |

## Security Deep Dive

- **Password Hashing (`bcrypt`):** Passwords are never stored in plaintext. `bcrypt` incorporates a work factor, making hashing intentionally slow. This protects user credentials against brute-force and rainbow-table attacks.
- **JWT Lifecycle:** Tokens are issued with a short expiration time (e.g., 30 minutes). Because JWTs are stateless (not stored in the DB), they cannot be easily invalidated. The short lifespan reduces the window of opportunity if a token is compromised.
- **IDOR Prevention:** Insecure Direct Object Reference (IDOR) is prevented by strictly scoping queries and actions. Instead of accepting a generic user ID or blindly deleting a requested resource, the API derives the `current_user.id` from the JWT token and verifies that the resource genuinely belongs to that authenticated user.

## Interview Q&A

**1. Why use `bcrypt` instead of `md5` or `sha256`?**
`bcrypt` is computationally slow by design. Fast hashing algorithms like MD5 or SHA256 can be brute-forced extremely quickly by modern hardware (GPUs). `bcrypt` protects against this by adding a "cost factor" to slow down the process.

**2. Why include an expiry time in the JWT?**
JWTs are stateless; once issued, the server doesn't keep track of them in a database, making them hard to revoke immediately. A short expiry limits the time an attacker can use a stolen token.

**3. What does "stateless auth" mean?**
It means the server does not store session information in a database or memory. All the necessary information to verify the user (like their identity and token signature) is contained within the JWT itself. 

**4. How does the API prevent IDOR?**
When fetching or deleting an expense, the API always verifies ownership. It filters the database query using `user_id == current_user.id`, ensuring users can never interact with records they do not own, even if they guess the ID of another user's expense.

**5. How would you handle token revocation?**
Because standard JWTs are stateless, you cannot simply "delete" them. Common approaches include: keeping token lifetimes very short (using refresh tokens to obtain new access tokens), or maintaining a "blacklist" (or blocklist) in a fast cache like Redis for tokens that have been explicitly logged out before they naturally expire.

## cURL Examples

**Signup:**
```bash
curl -X 'POST' 'http://127.0.0.1:8000/signup' \
  -H 'Content-Type: application/json' \
  -d '{"email": "user@example.com", "password": "mysecretpassword"}'
```

**Login:**
```bash
curl -X 'POST' 'http://127.0.0.1:8000/login' \
  -H 'Content-Type: application/json' \
  -d '{"email": "user@example.com", "password": "mysecretpassword"}'
```

**Create Expense (Requires Token):**
```bash
curl -X 'POST' 'http://127.0.0.1:8000/expenses' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"amount": 150.5, "category": "Groceries", "description": "Weekly food"}'
```
