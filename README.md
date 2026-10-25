# ChatDesk — Business Support Website with Live Chat

> Roman Urdu summary: ChatDesk ek full-stack portfolio project hai — aik company website jis par visitor live chat kar sakta hai, aur support team admin dashboard se reply de sakti hai. Frontend Angular hai, backend Node.js + Socket.IO hai, aur database MongoDB hai (agar MongoDB na ho to demo ke liye in-memory store bhi kaam karta hai).

ChatDesk is a professional company website with a live-chat widget for visitors and a JWT-protected admin dashboard for the support team. It is a **portfolio demo, not a real company**: there is no real support team, no real users, and no payments.

## Features

### Public side (visitors)
- Home, Services, About and Contact pages (Angular standalone components).
- Bottom-right chat widget on every page: enter a name, start a chat, send messages.
- Typing indicator and message timestamps.
- Messages are delivered in real time with Socket.IO and saved to the database (or in-memory store).

### Admin side (support team)
- Login with JWT (Angular route guard protects `/admin/dashboard` and `/admin/chat/:id`).
- Dashboard listing all active chats, newest first.
- Open any chat, see full history, and reply in real time.
- Unread count: visitor messages increase it; opening a chat in the dashboard clears it.

## Architecture

```
Visitor browser (Angular) ── REST + Socket.IO ──► Express server
        │                                            │
        │  join-conversation / send-message / typing │
        ▼                                            ▼
  Chat widget / Admin dashboard              Socket.IO rooms
                                                      │
                                               Mongoose models
                                               (MongoDB)
                                                      │
                                        fallback: in-memory store
                                        (when MONGODB_URI is unset
                                         or MongoDB cannot connect)
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Angular 22, standalone components, signals, TypeScript, plain CSS |
| Real-time | Socket.IO (`socket.io` server, `socket.io-client` frontend) |
| Backend | Node.js + Express |
| Database | MongoDB via Mongoose (User, Conversation, Message) |
| Auth | JWT (`jsonwebtoken`), bcrypt password hashing, Angular route guard + HTTP interceptor |

**Honest styling note:** this build uses clean plain CSS, not Tailwind. Tailwind/PostCSS setup was skipped deliberately to keep the build reliable and readable; the component structure is the same either way, and Tailwind can be added later without changing the features.

## Database schema

**User** — `name`, `email` (unique, lowercase), `passwordHash`, `role` (default `agent`), timestamps.

**Conversation** — `visitorName`, `subject`, `status` (`open` / `closed`), `unreadCount`, `lastMessageAt`, timestamps.

**Message** — `conversationId`, `conversationKey` (string form of the id, used for lookups), `sender` (`visitor` / `agent`), `senderName`, `text`, `createdAt`.

## API endpoints

Base URL (local): `http://localhost:3000`

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | — | Health check |
| POST | `/api/auth/login` | — | `{ email, password }` → `{ token, user }` |
| GET | `/api/auth/me` | JWT | Current token owner |
| POST | `/api/conversations` | — | Visitor starts a chat: `{ visitorName, subject? }` |
| GET | `/api/conversations` | JWT | List all chats, newest first |
| GET | `/api/conversations/:id` | — | One conversation (id is the handle; see demo notes) |
| PATCH | `/api/conversations/:id/read` | JWT | Clear unread count |
| GET | `/api/conversations/:id/messages` | — | Message history for a chat |
| POST | `/api/conversations/:id/messages` | visitor: none, agent: JWT | Send a message |

## Socket.IO events

Rooms are named `conv:<conversationId>`.

| Direction | Event | Payload |
|---|---|---|
| Client → server | `join-conversation` | conversation id |
| Client → server | `send-message` | `{ conversationId, sender, senderName, text }` |
| Client → server | `typing` | `{ conversationId, sender, senderName, isTyping }` |
| Server → client | `joined` | `{ conversationId }` |
| Server → client | `message` | a `ChatMessage` object |
| Server → client | `typing` | `{ conversationId, sender, senderName, isTyping }` |
| Server → client | `error-message` | `{ error }` |

## Setup guide

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env   # optional; edit JWT_SECRET and MONGODB_URI
npm start              # http://localhost:3000
```
Without `MONGODB_URI`, the server logs `using in-memory store (demo mode)` and works exactly the same, except data resets on restart.

With MongoDB (local or Atlas), set:
```
MONGODB_URI=mongodb://localhost:27017/chatdesk
# or your Atlas connection string
JWT_SECRET=a-long-random-secret
FRONTEND_ORIGIN=http://localhost:4200
```

### 2. Frontend
```bash
cd frontend
npm install
npm start              # http://localhost:4200 (Angular dev server)
# Production build:
npm run build          # output: frontend/dist/frontend/
```
The frontend talks to `http://localhost:3000` by default — see `frontend/src/app/core/config.ts` and change `API_URL` for a deployed backend.

### 3. Try it
1. Open `http://localhost:4200`, click **Chat** (bottom-right), enter a name and start a chat.
2. In another tab, open `http://localhost:4200/admin/login` and log in (demo credentials below).
3. Open the chat from the dashboard and reply — the visitor tab receives it instantly, and vice versa.

## Screenshots

![ChatDesk home page](docs/screenshots/home.png)
![Chat widget with a visitor message](docs/screenshots/chat-widget.png)
![Admin login](docs/screenshots/admin-login.png)
![Support dashboard with unread chats](docs/screenshots/admin-dashboard.png)
![Admin chat window with reply box](docs/screenshots/admin-chat.png)

## Demo notes (read before showing this to anyone)

- **Demo admin (DEMO ONLY):** `admin@chatdesk.demo` / `demo123`. It is seeded automatically unless `DEMO_ADMIN_ENABLED=false` or `ADMIN_EMAIL`/`ADMIN_PASSWORD` are set. Change it before any real use; it is not a real person's account.
- **In-memory fallback:** without MongoDB, chats and messages live only in server memory and disappear on restart. The API and Socket behaviour are identical.
- **Visitor access:** a visitor's conversation is fetched by its id. That is fine for a demo, but a production version should add a visitor token so one visitor cannot guess another chat's id.
- **No real users or data:** do not add contact details, photos or personal data to this project.

## Folder structure

```
chatdesk/
  README.md
  frontend/                        # Angular app
    src/app/
      core/                        # auth.service, socket.service, chat.service,
                                   # auth.guard, auth.interceptor, config, models
      shared/                      # navbar, footer
      features/
        home/ services/ about/ contact/
        chat-widget/               # bottom-right live chat widget
        admin/ login/ dashboard/ chat-window/
      app.ts app.html app.routes.ts app.config.ts
  backend/                         # Node.js + Express + Socket.IO
    server.js socket.js db.js
    models/                        # User, Conversation, Message (Mongoose)
    routes/                        # auth, conversations
    middleware/                    # JWT auth
    .env.example
```

## Deployment notes

- **Frontend → Vercel:** import the repo, set the root to `frontend`, build command `npm run build`, output `dist/frontend/browser`. Set `API_URL` in `frontend/src/app/core/config.ts` to the deployed backend URL before building (or use a Vercel environment-based replacement).
- **Backend → Render:** create a Web Service with root `backend`, build command `npm install`, start command `npm start`. Set `PORT` (Render provides it), `JWT_SECRET`, `MONGODB_URI` (Atlas), and `FRONTEND_ORIGIN` to the Vercel URL. Without `MONGODB_URI` it still runs, but in-memory data is lost on every redeploy/restart — use MongoDB Atlas for anything beyond a demo.
- **CORS:** the backend allows only `FRONTEND_ORIGIN` (default `http://localhost:4200`).

## Future improvements

- Visitor access tokens for conversations.
- Agent assignment, chat status (open/closed), and search/filter on the dashboard.
- File/image messages, canned replies, and email notifications.
- Tests: backend route tests (e.g. Vitest/Jest) and Angular component tests.
- Tailwind CSS migration if a utility-first design system is wanted.
- Rate limiting and input sanitisation hardening for production.
