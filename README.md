# SocialBuzz 🐝

A backend REST API for a social media platform built with Node.js, TypeScript, Express, Redis, and PostgreSQL.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-blue)
![Redis](https://img.shields.io/badge/Redis-cache%2Fqueue-red)
![Docker](https://img.shields.io/badge/Docker-containerized-blue)
![Tests](https://img.shields.io/badge/coverage-80%25-brightgreen)

---

## Current Features
- **User Authentication** — Signup, login with JWT access and refresh tokens
- **Refresh Token Rotation** — Separate `refresh_token` table with token family chaining via self-referencing `parent_id` FK, bcrypt-hashed token storage, reuse detection with full session revocation on suspected theft
- **Posts** — Create and edit posts (ownership-protected)
- **Likes** — Like and unlike posts with race-condition-safe unique constraints
- **Comments** — Comment on any post (edit or delete comment as well)
- **Feed** — Paginated feed of posts from followed users
- **Follow** — Users can follow others
- **Email Notification** — Users get email notifications via Resend (queued through Redis with BullMQ)

---

## Tech Stack
- **Runtime** — Node.js
- **Language** — TypeScript
- **Framework** — Express.js
- **Database** — PostgreSQL
- **Auth** — JWT (Access + Refresh Tokens)
- **Validation** — Joi
- **Testing** — Jest with Supertest (80% test coverage)
- **Caching / Rate limiting** — Redis
- **Queue** — BullMQ
- **Email** — Resend
- **Containerization** — Docker
- **CI/CD** — GitHub Actions

---

## Architecture
Routes are organized by resource, with each route delegating to its own controller file for request handling — keeping route definitions thin and business logic isolated and testable.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `auth/signUp` | Register a new user |
| POST | `auth/login` | Login and receive tokens |
| POST | `auth/refreshToken` | Refresh access tokens with refresh tokens |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `posts/content` | Create a new post |
| PUT | `posts/editPost/:postId` | Edit your own post |
| DELETE | `posts/delete/:postId` | Delete your own post |

### Likes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `likes/likePost/:postId` | Like a post |
| DELETE | `likes/unlikePost/:postId` | Unlike a post |
| GET | `posts/totalLikes/:postId` | Provides the total likes count for a specific post |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `comment/postComment/:postId` | Comment on a post |
| DELETE | `comment/deleteComment/:postId/:commentId` | Delete your own comment on a post |
| PATCH | `comment/updateComment/:postId/:commentId` | Edit your own comment on a post |

---

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL
- Redis

### Installation
```bash
git clone https://github.com/AshishResolute/socialbuzz
cd socialbuzz
npm install
```

### Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
DB_HOST=HOST_NAME
DB_PORT=5432 # currently localhost, later Render external database
DB_NAME
DB_PASSWORD
DB_USER
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
RESEND_API_KEY
NODE_ENV=development||testing
```

### Run
```bash
# Development
npm run dev

# Production
npm start
```

---

## Roadmap
- [x] User authentication (signup/login)
- [x] Create and edit posts
- [x] Like/unlike posts
- [x] Comments
- [x] Follow/unfollow users
- [x] Notifications (BullMQ + Redis)
- [x] Real email delivery (Resend)
- [x] Test suite (Jest + Supertest, 80% coverage)
- [x] Docker support
- [x] CI using GitHub Actions
- [x] Migrated to TypeScript
- [x] File uploads (Multer + Cloudinary)
- [ ] API documentation (Swagger)
- [x] Full text search(postgres)

---

## Author
**Ashish** — [github.com/AshishResolute](https://github.com/AshishResolute)
