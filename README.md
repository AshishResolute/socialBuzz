# SocialBuzz 🐝

A backend REST API for a social media platform built with Node.js, Express, Redis and  PostgreSQL.

---

## Current Features

- **User Authentication** — Signup, login with JWT access and refresh tokens
- **Posts** — Create and edit posts (ownership-protected)
- **Likes** — Like and unlike posts with race-condition-safe unique constraints
- **Comments** —  Comment on any Post (Edit or delete comment aswell)
- **Feed** — Paginated feed of posts from followed users
- **Follow** — Users can Follow others
- **Email Notification** — Users can get Email notification through Resend (used Redis with BullMQ) 
---

## Tech Stack

- **Runtime** — Node.js
- **Framework** — Express.js
- **Database** — PostgreSQL
- **Auth** — JWT (Access + Refresh Tokens)
- **Validation** — Joi
- **Testing** — Jest with SuperTest (80% Test Coverage)
- **Rate limiting** – Redis
- **Queue** — BullMQ
- **Email** — Resend
- **Containerization** — Docker

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
| DELETE | `posts/delete/:postId` | Delete Your own post |

### Likes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `likes/likePost/:postId` | Like a post |
| DELETE | `likes/unlikePost/:postId` | Unlike a post |
| GET | `posts/totalLikes/:postId` | Provides the total likes count for user specific post |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `comment/postComment/:postId` | Comment in a post |
| DELETE | `comment/deleteComment/:postId/:commentId` | Users can delete their comment in a post |
| PATCH | `comment/updateComment/:postId/:commentId` | Users can edit their comment in a post |
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
DB_PORT=5432(Currently localhost later render external database)
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
- [x] Real email delivery (resend)
- [ ] File uploads (Multer + Cloudinary)
- [ ] API documentation (Swagger) (Have started now atleast 1 path will be documented everyday)
- [x] Test suite (Jest + Supertest) (Have started testing and completed the Auth route) (80% Test Coverage)
- [x] Docker support
- [x] ci using GitHub Actions
---

## Author

**Ashish** — [github.com/AshishResolute](https://github.com/AshishResolute)
