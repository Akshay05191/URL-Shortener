# Smart URL Shortener

A full-stack URL shortening service with click analytics, QR code generation, custom aliases, password protection, and expiring links — built with React, Node.js, Express, and MongoDB Atlas.

---

## Features

- **JWT Authentication** — Secure signup/login with bcrypt password hashing and 30-day tokens
- **URL Shortening** — Instantly generate compact short links from any URL
- **Custom Aliases** — Choose your own short code (e.g. `/akshay-portfolio`)
- **QR Code Generation** — Auto-generated QR code for every link, downloadable as PNG
- **Click Analytics** — Track total clicks, click history, and last visited time
- **Analytics Dashboard** — Charts showing activity over the last 30 days
- **Password-Protected Links** — Gate links behind a password before redirecting
- **Expiring URLs** — Set links to expire after 1 day, 7 days, or a custom date
- **Dark Mode** — Full dark/light mode toggle with localStorage persistence
- **Responsive UI** — Works on mobile, tablet, and desktop

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, Vite, TypeScript              |
| Styling   | Tailwind CSS v4, shadcn/ui, Radix UI    |
| Charts    | Recharts                                |
| Routing   | Wouter                                  |
| State     | TanStack Query (React Query)            |
| Backend   | Node.js, Express 5, TypeScript          |
| Database  | MongoDB Atlas (Mongoose ODM)            |
| Auth      | JWT (jsonwebtoken) + bcrypt             |
| QR Codes  | qrcode npm package                      |
| Logging   | Pino + pino-pretty                      |

---

## Architecture

```
smart-url-shortener/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api.ts       # All API calls and TanStack Query hooks
│   │   │   ├── auth.tsx     # Auth context provider
│   │   │   └── utils.ts     # Utility functions
│   │   ├── hooks/           # Custom React hooks
│   │   ├── components/      # Shared UI components
│   │   │   └── ui/          # shadcn/ui component library
│   │   └── pages/           # Route-level page components
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── server/                  # Express API server
│   ├── src/
│   │   ├── models/          # Mongoose schemas (User, ShortUrl)
│   │   ├── controllers/     # Route handler logic
│   │   ├── middleware/      # Auth middleware (JWT verification)
│   │   ├── routes/          # Express route definitions
│   │   └── lib/             # Logger, MongoDB connection
│   ├── package.json
│   └── tsconfig.json
│
├── .env.example
├── .gitignore
└── README.md
```

### API Flow

```
Browser → React (Vite) → /api/* → Express → MongoDB Atlas
                       ↗
Short link click → /r/:code → Express resolves → Redirects to originalUrl
```

---


## Prerequisites

- Node.js 18+
- npm or pnpm
- A [MongoDB Atlas](https://cloud.mongodb.com) account (free tier works)

---

## MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a new **Project** and then a **Cluster** (M0 Free Tier)
3. Under **Database Access**, create a database user with read/write permissions
4. Under **Network Access**, add your IP address (or `0.0.0.0/0` for all IPs)
5. Click **Connect** → **Connect your application** → copy the connection string
6. Replace `<password>` in the connection string with your actual database user password
7. Add the database name to the connection string: `.../urlshortener?retryWrites=true&w=majority`

Example connection string:
```
mongodb+srv://myuser:mypassword@cluster0.abc12.mongodb.net/urlshortener?retryWrites=true&w=majority
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/smart-url-shortener.git
cd smart-url-shortener
```

### 2. Set up environment variables

```bash
cp .env.example server/.env
```

Edit `server/.env` and fill in your values:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/urlshortener?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
PORT=5000
NODE_ENV=development
```

### 3. Install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

## Run Locally

### Start the backend server

```bash
cd server
npm run dev
```

Server runs at `http://localhost:5000`

### Start the frontend

In a separate terminal:

```bash
cd client
npm run dev
```

Frontend runs at `http://localhost:5173`

The client proxies `/api` requests to the backend automatically via Vite's proxy config.

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register a new user | No |
| POST | `/api/auth/login` | Login and receive JWT | No |
| GET | `/api/auth/me` | Get current user info | Yes |

**Signup body:**
```json
{ "name": "Akshay", "email": "akshay@example.com", "password": "securepassword" }
```

**Login response:**
```json
{ "token": "eyJhbG...", "user": { "id": "...", "email": "...", "name": "...", "createdAt": "..." } }
```

### URL Shortening

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/urls` | List all user URLs | Yes |
| POST | `/api/urls` | Create a short URL | Yes |
| GET | `/api/urls/:id` | Get a specific URL | Yes |
| PATCH | `/api/urls/:id` | Update title/expiry | Yes |
| DELETE | `/api/urls/:id` | Delete a URL | Yes |

**Create URL body:**
```json
{
  "originalUrl": "https://example.com/very/long/path",
  "customAlias": "my-link",
  "title": "My Campaign",
  "password": "secret",
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

**Query params for list:**
- `search` — Search by title, alias, or original URL
- `sortBy` — `createdAt` | `clicks` | `title`
- `sortOrder` — `asc` | `desc`
- `filter` — `all` | `active` | `expired` | `password_protected`

### Public Redirect

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/r/:code` | Resolve a short code |
| POST | `/api/r/:code/verify-password` | Verify password for protected links |

### Analytics

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/urls/:id/analytics` | Per-URL click history | Yes |
| GET | `/api/analytics/dashboard` | Aggregated dashboard stats | Yes |

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JWT tokens (32+ chars) | `my-super-secret-...` |
| `PORT` | Port for the Express server | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |

---

## Future Improvements

- [ ] Link editing (update original URL)
- [ ] Bulk URL import via CSV
- [ ] Custom domain support
- [ ] Browser/device/country analytics breakdown
- [ ] Team workspaces and shared links
- [ ] Public API with API key authentication
- [ ] Link preview (unfurl metadata)
- [ ] Rate limiting per user
- [ ] Email notifications for expiring links
- [ ] Admin dashboard

---

## Author

**Akshay**

- GitHub: [@akshay](https://github.com/akshay)
- LinkedIn: [linkedin.com/in/akshay](https://linkedin.com/in/akshay)

---

## License

MIT — feel free to use and modify for personal or commercial projects.
