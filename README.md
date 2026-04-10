# SocialBuzz 🐝

A backend REST API for a social media platform built with Node.js, Express, and PostgreSQL.

> **Note:** This project is currently under active development. Features are being added incrementally.

---

## Current Features

- **User Authentication** — Signup, login with JWT access and refresh tokens
- **Posts** — Create and edit posts (ownership-protected)
- **Likes** — Like and unlike posts with race-condition-safe unique constraints

---

## Tech Stack

- **Runtime** — Node.js
- **Framework** — Express.js
- **Database** — PostgreSQL
- **Auth** — JWT (Access + Refresh Tokens)
- **Validation** — Joi
- **Cache/Queue** — Redis (BullMQ)

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `auth/signUp` | Register a new user |
| POST | `auth/login` | Login and receive tokens |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `posts/content` | Create a new post |
| PUT | `posts/editPost/:postId` | Edit your own post |

### Likes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `likes/likePost/:PostId` | Like a post |
| DELETE | `likes/unlikePost/:PostId` | Unlike a post |

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
- [ ] Test suite (Jest + Supertest) (Have started testing and completed the Auth route)
- [ ] Docker support

---

## Author

**Ashish** — [github.com/AshishResolute](https://github.com/AshishResolute)
