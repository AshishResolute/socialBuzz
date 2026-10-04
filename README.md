# SocialBuzz 🐝

A production-ready backend REST API for a social media platform built with **Node.js**, **TypeScript**, **Express**, **PostgreSQL**, **Redis**, and **BullMQ**.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-blue)
![Redis](https://img.shields.io/badge/Redis-cache%2Fqueue-red)
![Docker](https://img.shields.io/badge/Docker-containerized-blue)
![Swagger](https://img.shields.io/badge/Swagger-API%20Docs-green)

---

## Features

- **Authentication** — Signup / Login with JWT access tokens + secure refresh token rotation (token family chaining + reuse detection)
- **Password Reset** — Forgot password + reset token flow
- **Posts** — Create, edit, delete posts (ownership protected)
- **Bookmarks** — Save / unsave posts
- **Full-text Search** — PostgreSQL `tsvector` powered search on post content
- **Likes** — Like posts (race-condition safe unique constraints)
- **Comments** — Create, edit, delete comments + like comments
- **Follow System** — Follow users + get follower list
- **Personalized Feed** — Paginated feed of posts from people you follow (with recommended posts fallback)
- **User Profiles** — View public profile, update bio/display name/location/socials, upload profile picture (Cloudinary)
- **Email Notifications** — Queued via BullMQ + Redis, delivered with Resend
- **Rate Limiting** — Redis-backed rate limiting on auth & post creation
- **Validation** — Global Joi validation middleware for body / params / query
- **API Docs** — Swagger UI available at `/api-docs`
- **Docker** + GitHub Actions CI

---

## Tech Stack

| Category          | Technology                          |
|-------------------|-------------------------------------|
| Runtime           | Node.js 18+                         |
| Language          | TypeScript                          |
| Framework         | Express 5                           |
| Database          | PostgreSQL                          |
| Cache / Queue     | Redis + BullMQ                      |
| Auth              | JWT (Access + Refresh Token Rotation) |
| Validation        | Joi                                 |
| File Upload       | Multer + Cloudinary                 |
| Email             | Resend                              |
| Docs              | Swagger / OpenAPI                   |
| Testing           | Vitest                              |
| Containerization  | Docker + Docker Compose             |
| CI/CD             | GitHub Actions                      |

---

## Architecture

Routes are thin and resource-based. Each route file only wires middleware + controller.  
Business logic lives in dedicated controller files.  
Global error handling, Joi validation, JWT verification, and rate limiting are applied via middleware.

---

## API Endpoints

> **Base URL**: `http://localhost:3000`  
> **Auth**: Most protected routes expect `Authorization: Bearer <access_token>`  
> **Refresh Token**: Stored in httpOnly cookie named `refreshToken`

### Health
| Method | Endpoint   | Auth | Description                    |
|--------|------------|------|--------------------------------|
| GET    | `/health`  | No   | Health check – returns status  |

### Authentication (`/auth`)
| Method | Endpoint                              | Auth | Description |
|--------|---------------------------------------|------|-------------|
| POST   | `/auth/signup`                        | No   | Register a new user |
| POST   | `/auth/login`                         | No   | Login → returns access token + sets refresh token cookie |
| POST   | `/auth/refresh`                       | Cookie | Rotate refresh token & get new access token |
| POST   | `/auth/forgotPassword`                | No   | Request password reset link |
| POST   | `/auth/resetPassword/:resetPasswordToken` | No | Reset password using token |

**Signup body**
```json
{
  "email": "user@example.com",
  "password": "SecurePass1!",
  "confirmPassword": "SecurePass1!",
  "userName": "ashish"
}
```

**Login body**
```json
{
  "email": "user@example.com",
  "password": "SecurePass1!"
}
```

### Posts (`/post`)
| Method | Endpoint                    | Auth | Description |
|--------|-----------------------------|------|-------------|
| POST   | `/post/content`             | Yes  | Create a new post |
| PUT    | `/post/editPost/:postId`    | Yes  | Edit your own post |
| DELETE | `/post/:postId`             | Yes  | Delete your own post |
| POST   | `/post/:postId/savePost`    | Yes  | Bookmark / unbookmark a post (toggle) |
| GET    | `/post/savedPost`           | Yes  | Get all bookmarked posts |
| DELETE | `/post/:postId/savedPost`   | Yes  | Remove a specific bookmark |
| GET    | `/post/search?userQuery=`   | Yes  | Full-text search posts |

**Create / Edit post body**
```json
{
  "content": "This is my post content (min 30 characters)"
}
```

### Likes (`/like`)
| Method | Endpoint                  | Auth | Description |
|--------|---------------------------|------|-------------|
| POST   | `/like/likePost/:postId`  | Yes  | Like a post |
| GET    | `/like/getLikes/:postId`  | No   | Get total like count for a post |

### Comments (`/comment`)
| Method | Endpoint                          | Auth | Description |
|--------|-----------------------------------|------|-------------|
| POST   | `/comment/:postId`                | Yes  | Add a comment |
| PATCH  | `/comment/:postId/:commentId`     | Yes  | Edit your own comment |
| DELETE | `/comment/:postId/:commentId`     | Yes  | Delete your own comment |
| POST   | `/comment/like/:commentId`        | Yes  | Like a comment |

**Comment body**
```json
{
  "userComment": "Nice post!"
}
```

### Feed (`/feed`)
| Method | Endpoint          | Auth | Description |
|--------|-------------------|------|-------------|
| GET    | `/feed?page=1&limit=10` | Yes | Paginated feed of posts from users you follow (falls back to recommended posts) |

### Follow (`/follow`)
| Method | Endpoint                     | Auth | Description |
|--------|------------------------------|------|-------------|
| POST   | `/follow/:userId`            | Yes  | Follow a user |
| GET    | `/follow/followers/:userId`  | No   | Get list of followers of a user |

### Users (`/user`)
| Method | Endpoint                | Auth | Description |
|--------|-------------------------|------|-------------|
| GET    | `/user/:username`       | No   | Get public profile + posts + follower count |
| PUT    | `/user/profileUpdate`   | Yes  | Update display_name, bio, location, socials |
| POST   | `/user/profilePhoto`    | Yes  | Upload profile picture (`multipart/form-data`, field name: `profilePic`) |

**Profile update body** (at least one field required)
```json
{
  "display_name": "Ashish",
  "bio": "Backend developer learning TypeScript",
  "location": "India",
  "socials": ["https://github.com/AshishResolute"]
}
```

### API Documentation
| Method | Endpoint     | Description          |
|--------|--------------|----------------------|
| GET    | `/api-docs`  | Swagger UI           |

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
Create a `.env` (or `dev.env`) file:

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
Run the schema file:
```bash
psql -U postgres -d socialbuzz -f src/database/schema.sql
```

### Run
```bash
# Development (hot reload)
npm run dev

# Production
npm start
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
├── routes/            # Route definitions
├── Middlewares/       # Auth, validation, error handler, multer
├── Validator/         # Joi schemas
├── database/          # PG connection, Redis, schema
├── queues/            # BullMQ email queue
├── emailWorker/       # Email worker
├── util/              # Helpers (cloudinary, catchAsync, etc.)
├── ErrorHandler/      # Custom error classes
├── interfaces/        # TypeScript interfaces
└── config/            # Swagger + config
```

---

## Roadmap

- [x] JWT Auth + Refresh Token Rotation
- [x] Posts CRUD + Ownership checks
- [x] Likes & Comments
- [x] Follow system + Feed
- [x] Bookmarks
- [x] Full-text search (PostgreSQL)
- [x] Profile picture upload (Cloudinary)
- [x] Email notifications (BullMQ + Resend)
- [x] Rate limiting
- [x] Global Joi validation
- [x] Docker + GitHub Actions
- [x] TypeScript migration
- [ ] Swagger documentation completion
- [ ] Frontend integration

---

## Author

**Ashish Kumar Gourh**  
GitHub: [AshishResolute](https://github.com/AshishResolute)  
Portfolio: [portfolio](https://portfolio-seven-theta-gr81z8gaqt.vercel.app/)

---

Made with ❤️ by Ashish
