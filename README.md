# SocialBuzz 🐝

A production-style social media backend REST API built with **Node.js**, **TypeScript**, **Express 5**, **PostgreSQL**, **Redis**, and **BullMQ**.

Focused on correct authentication flows, concurrency safety, clean architecture, and real-world patterns (token rotation, rate limiting, background jobs, full-text search).

---

## Features

- **Authentication**
  - Signup / Login with JWT access tokens (15 min expiry)
  - Secure refresh token rotation with token family chaining + reuse detection
  - Password reset flow (hashed token + 15-minute expiry)
- **Posts** — Create, edit, and delete posts with ownership protection
- **Bookmarks** — Toggle save/unsave + list saved posts
- **Full-text Search** — Powered by PostgreSQL `tsvector` + `plainto_tsquery`
- **Likes** — Toggle likes on posts (race-condition safe via unique constraints)
- **Comments** — Create, edit, delete comments + toggle likes on comments
- **Follow System** + Personalized Feed (paginated)
- **User Profiles**
  - Public profile view (with Redis caching)
  - Update display name, bio, location, and socials
  - Profile picture upload via Cloudinary
- **Background Jobs** — BullMQ + Redis for email notifications (Resend)
- **Rate Limiting** — Redis-backed rate limiting on authentication and post creation
- **Validation** — Global Joi validation middleware for body, params, and query
- **API Documentation** — Swagger UI available at `/api-docs`
- **Docker** + Docker Compose + GitHub Actions CI
- **Tests** — Vitest + Supertest

---

## Tech Stack

| Category             | Technology                          |
|----------------------|-------------------------------------|
| Runtime              | Node.js 18+                         |
| Language             | TypeScript                          |
| Framework            | Express 5                           |
| Database             | PostgreSQL                          |
| Cache / Queue        | Redis + BullMQ                      |
| Authentication       | JWT (Access + Refresh Token Rotation) |
| Validation           | Joi                                 |
| File Upload          | Multer + Cloudinary                 |
| Email                | Resend                              |
| Documentation        | Swagger / OpenAPI                   |
| Testing              | Vitest + Supertest                  |
| Containerization     | Docker + Docker Compose             |
| CI/CD                | GitHub Actions                      |

---

## Architecture

- Routes are thin and only wire middleware + controllers
- Business logic lives in dedicated controller files
- Global error handling, JWT verification, rate limiting, and Joi validation are applied via middleware
- Database queries use parameterized statements
- Email work is offloaded to BullMQ workers
- Redis is used for rate limiting and short-term caching (profile data)

---

## API Reference

**Base URL:** `http://localhost:3000`  
**Authentication:** Protected routes require  
`Authorization: Bearer <access_token>`  

**Refresh Token:** Stored in an httpOnly cookie named `refreshToken`  
**Content-Type:** `application/json` (except profile photo upload)

Interactive documentation is also available at:  
→ [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### Health

| Method | Endpoint  | Auth | Description                  |
|--------|-----------|------|------------------------------|
| GET    | `/health` | No   | Health check – returns status |

### Authentication (`/auth`)

| Method | Endpoint                                  | Auth   | Rate Limited | Description                                          |
|--------|-------------------------------------------|--------|--------------|------------------------------------------------------|
| POST   | `/auth/signup`                            | No     | Yes          | Register a new user                                  |
| POST   | `/auth/login`                             | No     | Yes          | Login → returns access token + sets refresh cookie   |
| POST   | `/auth/refresh`                           | Cookie | No           | Rotate refresh token and issue a new access token    |
| POST   | `/auth/forgotPassword`                    | No     | No           | Request a password reset token                       |
| POST   | `/auth/resetPassword/:resetPasswordToken` | No     | No           | Reset password using the provided token              |

**Signup Body**
```json
{
  "email": "user@example.com",
  "password": "SecurePass1!",
  "confirmPassword": "SecurePass1!",
  "userName": "ashish"
}
```

**Login Body**
```json
{
  "email": "user@example.com",
  "password": "SecurePass1!"
}
```

### Posts (`/post`)

| Method | Endpoint                  | Auth | Rate Limited | Description                     |
|--------|---------------------------|------|--------------|---------------------------------|
| POST   | `/post/content`           | Yes  | Yes          | Create a new post               |
| PUT    | `/post/editPost/:postId`  | Yes  | Yes          | Edit your own post              |
| DELETE | `/post/:postId`           | Yes  | No           | Delete your own post            |
| POST   | `/post/:postId/savePost`  | Yes  | No           | Toggle bookmark (save / unsave) |
| GET    | `/post/savedPost`         | Yes  | No           | Get all bookmarked posts        |
| DELETE | `/post/:postId/savedPost` | Yes  | No           | Remove a specific bookmark      |
| GET    | `/post/search?userQuery=` | Yes  | No           | Full-text search posts          |

**Create / Edit Post Body**
```json
{
  "content": "This is my post content (minimum 30 characters)"
}
```

### Likes (`/like`)

| Method | Endpoint                 | Auth | Description                     |
|--------|--------------------------|------|---------------------------------|
| POST   | `/like/likePost/:postId` | Yes  | Toggle like on a post           |
| GET    | `/like/getLikes/:postId` | No   | Get total like count for a post |

### Comments (`/comment`)

| Method | Endpoint                      | Auth | Description                |
|--------|-------------------------------|------|----------------------------|
| POST   | `/comment/:postId`            | Yes  | Add a comment to a post    |
| PATCH  | `/comment/:postId/:commentId` | Yes  | Edit your own comment      |
| DELETE | `/comment/:postId/:commentId` | Yes  | Delete your own comment    |
| POST   | `/comment/like/:commentId`    | Yes  | Toggle like on a comment   |

**Comment Body**
```json
{
  "userComment": "Nice post!"
}
```

### Feed (`/feed`)

| Method | Endpoint                | Auth | Description                                   |
|--------|-------------------------|------|-----------------------------------------------|
| GET    | `/feed?page=1&limit=10` | Yes  | Paginated feed of posts from users you follow |

### Follow (`/follow`)

| Method | Endpoint                    | Auth | Description                      |
|--------|-----------------------------|------|----------------------------------|
| POST   | `/follow/:userId`           | Yes  | Follow a user                    |
| GET    | `/follow/followers/:userId` | No   | Get list of followers of a user  |

### Users (`/user`)

| Method | Endpoint              | Auth | Description                                      |
|--------|-----------------------|------|--------------------------------------------------|
| GET    | `/user/:username`     | No   | Get public profile + posts + follower count      |
| PUT    | `/user/profileUpdate` | Yes  | Update display_name, bio, location, socials      |
| POST   | `/user/profilePhoto`  | Yes  | Upload profile picture (`multipart/form-data`)   |

**Profile Update Body** (at least one field required)
```json
{
  "display_name": "Ashish",
  "bio": "Backend developer learning TypeScript",
  "location": "India",
  "socials": ["https://github.com/AshishResolute"]
}
```

**Profile Photo**
- Content-Type: `multipart/form-data`
- Field name: `profilePic`

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL
- Redis

### Installation

```bash
git clone https://github.com/AshishResolute/socialBuzz.git
cd socialBuzz
npm install
```

### Environment Variables

Create a `dev.env` (or `.env`) file:

```env
PORT=3000
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=socialbuzz
DB_USER=postgres
DB_PASSWORD=yourpassword

# JWT
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key

# Redis
REDIS_URL=redis://localhost:6379

# Resend (email)
RESEND_API_KEY=re_xxxxx
RESEND_USER_ACCOUNT_NAME=onboarding@resend.dev

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Database Setup

```bash
psql -U postgres -d socialbuzz -f src/database/schema.sql
```

### Run the Application

```bash
# Development (hot reload)
npm run dev

# Production
npm start

# Run tests
npm test
```

Server starts at `http://localhost:3000`  
Swagger docs: `http://localhost:3000/api-docs`

### Docker

```bash
docker-compose up --build
```

---

## Project Structure

```
src/
├── controllers/       # Business logic
├── routes/            # Route definitions (thin)
├── Middlewares/       # Auth, validation, error handler, multer
├── Validator/         # Joi schemas
├── database/          # PostgreSQL connection, Redis, schema
├── queues/            # BullMQ queues
├── emailWorker/       # Email worker
├── rateLimitter/      # Redis-backed rate limiters
├── util/              # Helpers (catchAsync, cloudinary, etc.)
├── ErrorHandler/      # Custom error classes
├── interfaces/        # TypeScript interfaces
├── types/
├── config/            # Swagger + configuration
└── tests/             # Vitest + Supertest tests
```

---

## Key Implementation Notes

- Refresh tokens use family chaining (`parent_id`) and reuse detection (`is_used` flag)
- Likes and bookmarks are implemented as toggles with unique constraints for concurrency safety
- Ownership is strictly enforced on post and comment mutations
- Profile data is cached in Redis (120s TTL)
- Post content has a minimum length of 30 characters
- Rate limiting is applied on authentication routes and post creation/editing

---

## Author

**Ashish Kumar Gourh**

- GitHub: [AshishResolute](https://github.com/AshishResolute)
- Portfolio: [portfolio](https://portfolio-seven-theta-gr81z8gaqt.vercel.app/)

---

Made with ❤️ by Ashish
```
