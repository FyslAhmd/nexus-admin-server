# NexusAdmin Backend

Role-based admin panel API with invitation-based user onboarding.

## Tech Stack

- **Runtime**: Node.js + Express.js
- **Language**: TypeScript
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Auth**: JWT (Access + Refresh tokens)
- **Validation**: express-validator
- **Security**: bcryptjs, helmet, cors, rate-limiting

## Architecture

```
src/
├── config/          # Database & environment config
├── controllers/     # Request handlers (thin layer)
├── middleware/      # Auth, validation, error handling
├── models/          # Mongoose schemas
├── routes/          # API route definitions
├── services/        # Business logic layer
├── types/           # TypeScript interfaces
├── utils/           # Helpers (token generation, email)
└── index.ts         # App entry point
```

### Design Patterns

- **Service Layer Pattern**: Controllers delegate to services for business logic
- **Repository Pattern**: Services interact with models, not directly in controllers
- **Middleware Chain**: Auth → Validation → Controller → Error Handler

### Data Models

| Model | Purpose |
|-------|---------|
| User | Stores user credentials, role, status |
| Project | Project entity with soft delete support |
| Invite | Invitation tokens with expiry |

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| ADMIN | Full access - manage users, roles, projects |
| MANAGER | View users, manage projects |
| STAFF | View & manage own projects only |

## Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

### Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/nexusadmin
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | Register via invite |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Invalidate refresh token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/invite` | Create invitation (Admin) |
| GET | `/api/auth/invite/:token` | Verify invite token |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users (Admin/Manager) |
| PATCH | `/api/users/:id/role` | Update role (Admin) |
| PATCH | `/api/users/:id/status` | Toggle status (Admin) |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Soft delete (Admin) |

## Tradeoffs & Assumptions

### Tradeoffs

1. **MongoDB over PostgreSQL**: Chose MongoDB for flexible schema and faster prototyping. For complex relational queries, PostgreSQL would be better.

2. **JWT over Sessions**: Stateless auth scales better but refresh token rotation adds complexity. Tokens can't be instantly invalidated without a blacklist.

3. **Soft Delete**: Projects are soft-deleted for audit trails. Increases storage but enables recovery.

4. **No Email Service**: Invitations return tokens directly instead of emailing. In production, integrate SendGrid/SES.

### Assumptions

1. **Single Tenant**: Designed for single organization use. Multi-tenancy would require schema changes.

2. **Trust Boundary**: All authenticated users are semi-trusted. No per-resource ownership checks for projects (any user can view all projects).

3. **Token Security**: Assumes HTTPS in production. Tokens are vulnerable over HTTP.

4. **Admin Bootstrap**: First user must be seeded as Admin or created via database directly.

## Default Admin

```
Email: info.faysal.32@gmail.com
Password: Ahmed@3632
```

## License

MIT
