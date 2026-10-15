# 🚨 FloorAlert

> **Report a machine problem in 30 seconds from your phone. Get it fixed before it becomes a breakdown.**

FloorAlert is a mobile-first maintenance communication and ticketing system built for industrial facilities, IT departments, and any organization where equipment downtime costs money. It replaces paper logs, verbal handoffs, and "I told the supervisor" with a structured, trackable, and fast reporting workflow.

---

## 📸 Screenshot

<!-- TODO: Replace with actual screenshot -->
<p align="center">
  <img src="docs/screenshot-demo.png" alt="FloorAlert Demo — Dashboard, Incident Reporting, and Work Order views" width="800" />
  <br/>
  <em>The FloorAlert demo: real-time dashboard, 5-tap incident reporting, and work order management — all in your browser.</em>
</p>

---

## ✨ Features

### 📝 Incident Reporting
- **5-tap, 30-second reporting** — Asset → Category → Severity → Details → Submit
- **QR code scanning** — Scan a code on any machine to auto-fill asset info
- **Photo & voice notes** — Capture visual evidence without typing
- **Offline mode** — Reports queue locally and sync when connection returns
- **Configurable categories** — Mechanical, Electrical, Hydraulic, IT/Network, Facility, Safety, Quality

### 🔔 Smart Notifications
- **Multi-channel delivery** — Push (FCM), SMS (Twilio), Email (SendGrid/SES), in-app
- **Intelligent routing** — Notifications go to the right role based on category + severity + location
- **Escalation engine** — Auto-escalate unacknowledged alerts up the chain (V1.1)
- **Configurable rules** — Managers define who gets notified, when, and how

### 🔧 Work Order Management
- **Full lifecycle tracking** — Reported → Triaged → Assigned → In Progress → Resolved → Closed
- **One-tap status updates** — Technicians update progress in seconds
- **Labor time tracking** — Automatic timer starts when work begins
- **Assignment modes** — Manual, round-robin, skill-based, load-balanced
- **Parts & materials logging** — Track what was used per work order

### 🏭 Asset Tracking
- **Hierarchical registry** — Site → Area → Line → Asset → Sub-asset
- **QR code integration** — Every asset gets a unique, printable QR code
- **Automatic status updates** — Operational / Degraded / Down / Decommissioned
- **Full work history** — Every work order linked to the asset
- **Document attachments** — Manuals, SOPs, wiring diagrams

### 📅 Preventive Maintenance (V1.1)
- **Time-based schedules** — Auto-generate PM work orders when due
- **Usage-based triggers** — Hours, cycles, or units
- **Compliance tracking** — PM-to-reactive ratio, on-time percentage
- **Procedure checklists** — Step-by-step instructions with parts lists

### 📊 Reporting & Analytics
- **Real-time dashboards** — Manager (desktop) and Technician (mobile) views
- **Key metrics** — Downtime, MTTR, MTBF, response time, resolution time
- **Recurring issue detection** — Flag assets with repeat problems
- **Technician performance** — WOs completed, avg resolution, first-time-fix rate
- **Backlog & aging reports** — Open work orders by age and severity

### 👥 User Roles & Access
| Role | Description |
|------|-------------|
| **Floor Worker** | Report issues, view own report status |
| **Technician** | Receive work orders, update status, log resolution |
| **Maintenance Manager** | Assign work, view dashboards, manage schedules |
| **Administrator** | System config, user management, audit logs |

---

## 🚀 Quick Start (Demo)

The demo is a fully self-contained single-page web app. No server, no build step, no dependencies.

### Option 1: Just Open It

```bash
# Clone the repo
git clone https://github.com/yourusername/FloorAlert.git
cd FloorAlert

# Open in your browser
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

### Option 2: Serve It (Recommended)

```bash
# Using Python (any version 3.7+)
python3 -m http.server 8080

# Then visit http://localhost:8080
```

That's it. The demo uses `localStorage` so data persists between sessions. Try creating an incident report, assigning a work order, or checking the manager dashboard.

---

## 🐳 Self-Hosted Deployment (Docker Compose)

The full FloorAlert stack — FastAPI backend, PostgreSQL, Redis, and Nginx — runs with a single command.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) 24.0+
- [Docker Compose](https://docs.docker.com/compose/install/) v2.0+

### 1-Click Deploy

```bash
git clone https://github.com/yourusername/FloorAlert.git
cd FloorAlert

# Copy and edit environment variables
cp .env.example .env
# Edit .env — set your database password, JWT secret, and optional API keys

# Launch the full stack
docker-compose up -d

# Run database migrations
docker-compose exec api alembic upgrade head

# Create your first admin user
docker-compose exec api python -m scripts.create_admin \
  --email admin@yourcompany.com \
  --name "Admin User" \
  --role admin
```

The app is now running at `http://localhost:8080`.

### Self-Hosted Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Facility Network                      │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Floor       │  │   Floor       │  │   Manager     │  │
│  │   Worker 1    │  │   Worker 2    │  │   Workstation │  │
│  │   (Phone)     │  │   (Tablet)    │  │   (Browser)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │           │
│         └────────────────┼─────────────────┘           │
│                          │                             │
│                   ┌──────┴──────┐                      │
│                   │  FloorAlert  │                      │
│                   │  Server      │                      │
│                   │  (Docker)    │                      │
│                   │              │                      │
│                   │  FastAPI     │                      │
│                   │  PostgreSQL  │                      │
│                   │  Redis       │                      │
│                   │  Nginx       │                      │
│                   └──────────────┘                      │
│                                                         │
│  No internet required. All data stays on-site.          │
└─────────────────────────────────────────────────────────┘
```

### Self-Hosted Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Storage | 50 GB | 100 GB+ |
| OS | Ubuntu 22.04 / Debian 12 / RHEL 9 | Ubuntu 22.04 LTS |

### Self-Hosted Configuration

Edit `.env` to configure optional services:

```env
# Required
DATABASE_PASSWORD=change-me-in-production
JWT_SECRET=change-me-to-a-long-random-string

# Optional — Email notifications
SMTP_HOST=smtp.yourcompany.com
SMTP_PORT=587
SMTP_USER=flooralert@yourcompany.com
SMTP_PASSWORD=your-smtp-password

# Optional — SMS notifications (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_FROM_NUMBER=+1234567890

# Optional — Push notifications (Firebase)
FIREBASE_SERVER_KEY=your-firebase-key

# Optional — File storage (S3-compatible)
S3_ENDPOINT=https://s3.yourcompany.com
S3_BUCKET=flooralert-uploads
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
```

### Self-Hosted Feature Matrix

| Feature | Cloud | Self-Hosted Intranet |
|---------|-------|---------------------|
| Push notifications | Firebase (FCM) | Local WebSocket + in-app |
| SMS notifications | Twilio | Optional: local SMS gateway |
| Email notifications | SendGrid / SES | Local SMTP relay |
| Authentication | Email + OAuth | LDAP / AD or local accounts |
| File storage | S3-compatible | Local disk / NAS |
| Backups | Automated to S3 | Local backup script |
| Updates | Automatic | Manual (Docker image pull) |
| Offline mode | Syncs on reconnect | Always on — same network |

---

## ☁️ Cloud Deployment

### Docker (Any Cloud Provider)

```bash
# Works on AWS EC2, GCP Compute Engine, DigitalOcean, Hetzner, etc.
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### AWS (ECS / App Runner)

```bash
# Build and push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker build -t flooralert-api ./backend
docker tag flooralert-api:latest <account>.dkr.ecr.<region>.amazonaws.com/flooralert-api:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/flooralert-api:latest

# Deploy via ECS task definition or App Runner
# See docs/aws-deployment.md for full walkthrough
```

### Google Cloud Run

```bash
# Build and deploy in one command
gcloud run deploy flooralert \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Kubernetes (Helm)

```bash
helm repo add flooralert https://charts.flooralert.com
helm install flooralert flooralert/flooralert \
  --set postgresql.password=change-me \
  --set jwt.secret=change-me
```

### Managed Platform Options

| Platform | Difficulty | Best For |
|----------|-----------|----------|
| **Railway** | ⭐ Easiest | Quick prototypes, small teams |
| **Render** | ⭐ Easy | Production with minimal config |
| **Fly.io** | ⭐⭐ Medium | Global edge deployment |
| **AWS ECS** | ⭐⭐⭐ Complex | Enterprise, full control |
| **GCP Cloud Run** | ⭐⭐ Medium | GCP shops, auto-scaling |
| **Kubernetes** | ⭐⭐⭐⭐ Advanced | Large-scale, multi-region |

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend (Web)** | React + TypeScript + Tailwind CSS | Responsive manager dashboard |
| **Mobile App** | React Native (Expo) | iOS + Android floor reporting |
| **Backend API** | Python (FastAPI) | High-performance async REST API |
| **Database** | PostgreSQL | Relational data, JSONB, full-text search |
| **Cache / Queue** | Redis | Sessions, rate limiting, job queue |
| **Real-time** | WebSocket (Socket.io) | Live dashboard updates |
| **File Storage** | S3-compatible (MinIO / R2) | Photos, voice notes, documents |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | Cross-platform mobile push |
| **SMS** | Twilio | High-severity SMS alerts |
| **Email** | SendGrid / AWS SES | Transactional email, digests |
| **Hosting** | Docker on AWS / GCP / DO | Containerized, portable |
| **CI/CD** | GitHub Actions | Automated testing & deployment |
| **Monitoring** | Sentry + UptimeRobot | Error tracking, uptime alerts |

---

## 📁 Project Structure

```
FloorAlert/
├── 📄 README.md                  # This file
├── 📄 FloorAlert_Spec.md         # Full product specification
├── 📄 docker-compose.yml         # Self-hosted deployment
├── 📄 docker-compose.prod.yml    # Production overrides
├── 📄 .env.example               # Environment variable template
│
├── 📁 web/                       # Demo single-page app
│   ├── 📄 index.html             # Entry point
│   ├── 📄 app.js                 # Application logic
│   ├── 📄 styles.css             # Tailwind + custom styles
│   └── 📁 assets/                # Icons, images
│
├── 📁 backend/                   # FastAPI backend
│   ├── 📄 main.py                # App entry point
│   ├── 📄 requirements.txt       # Python dependencies
│   ├── 📄 Dockerfile
│   ├── 📁 api/
│   │   ├── 📄 routes/            # API endpoint handlers
│   │   ├── 📄 models.py          # Pydantic schemas
│   │   └── 📄 dependencies.py    # Auth, DB session
│   ├── 📁 core/
│   │   ├── 📄 config.py          # Settings management
│   │   ├── 📄 security.py        # JWT, password hashing
│   │   └── 📄 database.py        # SQLAlchemy setup
│   ├── 📁 services/
│   │   ├── 📄 notifications.py   # Push, SMS, email routing
│   │   ├── 📄 escalation.py      # Escalation engine
│   │   └── 📄 analytics.py       # Metrics calculations
│   ├── 📁 models/                # SQLAlchemy ORM models
│   └── 📁 alembic/               # Database migrations
│
├── 📁 mobile/                    # React Native (Expo) app
│   ├── 📄 App.tsx                # Root component
│   ├── 📄 app.json               # Expo config
│   ├── 📁 src/
│   │   ├── 📁 screens/           # Report, Work Orders, Dashboard
│   │   ├── 📁 components/        # Reusable UI components
│   │   ├── 📁 navigation/        # React Navigation setup
│   │   ├── 📁 services/          # API client, offline sync
│   │   └── 📁 store/             # State management (Zustand)
│   └── 📁 assets/                # Images, fonts
│
├── 📁 docs/                      # Documentation
│   ├── 📄 api-reference.md       # API endpoint docs
│   ├── 📄 aws-deployment.md      # AWS deployment guide
│   ├── 📄 self-hosted-guide.md   # Self-hosted deployment guide
│   └── 📁 screenshot-demo.png    # Demo screenshot
│
├── 📁 scripts/                   # Utility scripts
│   ├── 📄 create_admin.py        # Create admin user
│   ├── 📄 seed_demo_data.py      # Seed database with demo data
│   └── 📄 backup.sh              # Backup script for self-hosted
│
└── 📁 .github/
    └── 📁 workflows/             # GitHub Actions CI/CD
        ├── 📄 ci.yml             # Lint, type-check, test
        └── 📄 deploy.yml         # Build & deploy
```

---

## 💻 Development Guide

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Python** 3.11+ and **pip**
- **Docker** 24+ with **Docker Compose**
- **PostgreSQL** 15+ (or use Docker)
- **Redis** 7+ (or use Docker)

### Clone & Setup

```bash
git clone https://github.com/yourusername/FloorAlert.git
cd FloorAlert
```

### Run the Demo (No Backend Needed)

```bash
cd web
python3 -m http.server 8080
# Visit http://localhost:8080
```

### Run the Full Stack Locally

```bash
# 1. Start infrastructure (PostgreSQL + Redis)
docker-compose up -d db redis

# 2. Set up backend
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your local database and Redis URLs

# 4. Run migrations
alembic upgrade head

# 5. Seed demo data (optional)
python -m scripts.seed_demo_data

# 6. Start the API
uvicorn main:app --reload --port 8000

# 7. In another terminal, start the web frontend
cd ../web
python3 -m http.server 8080

# 8. (Optional) Start the mobile app
cd ../mobile
npx expo start
```

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend linting
cd web
npm run lint

# Mobile type-checking
cd mobile
npx tsc --noEmit
```

### Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repo** and create a feature branch
2. **Make your changes** — follow the existing code style
3. **Write tests** — all new features should have test coverage
4. **Run the linter** — `ruff check .` (Python) / `npm run lint` (JS/TS)
5. **Submit a PR** — describe what changed and why

#### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add escalation timeout configuration
fix: resolve QR code scanner crash on Android 14
docs: update self-hosted deployment guide
test: add work order lifecycle integration tests
refactor: extract notification routing into service layer
```

#### Code Style

| Language | Formatter | Linter |
|----------|-----------|--------|
| Python | `black` + `isort` | `ruff` |
| TypeScript / React | `prettier` | `eslint` |
| CSS | `prettier` | `stylelint` |

---

## 🗺 Roadmap

See the full product specification and roadmap in **[FloorAlert_Spec.md](./FloorAlert_Spec.md)**.

### Near-Term (MVP — Weeks 1–8)
- [x] Demo single-page app with localStorage
- [ ] User roles & RBAC
- [ ] Mobile app (React Native / Expo)
- [ ] Incident reporting with QR, photo, voice
- [ ] Push, SMS, and email notifications
- [ ] Work order creation & assignment
- [ ] Asset registry with QR codes
- [ ] Manager dashboard (real-time KPIs)
- [ ] Technician mobile view
- [ ] Basic reports (downtime, MTTR, backlog)

### V1.1 (Weeks 9–12) — "Preventive & Escalation"
- [ ] Preventive maintenance scheduling
- [ ] Escalation engine with configurable rules
- [ ] Auto-assignment (round-robin, skill-based)
- [ ] Recurring issue detection
- [ ] Shift handoff reports

### V1.2 (Weeks 13–18) — "Enterprise Ready"
- [ ] Parts inventory (basic)
- [ ] Custom report builder
- [ ] Slack / Teams notifications
- [ ] SSO (Google, Microsoft, LDAP)
- [ ] Multi-site support
- [ ] Data export (CSV, API)

### V2.0 (Future) — "Intelligent Maintenance"
- [ ] IoT sensor integration (condition-based monitoring)
- [ ] AI-powered failure prediction
- [ ] Mobile AR for asset identification
- [ ] ERP system integrations

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Chris Carpenter

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📬 Contact

| | |
|---|---|
| **Author** | Chris Carpenter |
| **Email** | [chris@flooralert.com](mailto:chris@flooralert.com) |
| **GitHub** | [@yourusername](https://github.com/yourusername) |
| **Issues** | [GitHub Issues](https://github.com/yourusername/FloorAlert/issues) |
| **Discussions** | [GitHub Discussions](https://github.com/yourusername/FloorAlert/discussions) |

---

<p align="center">
  Built with ❤️ by a maintenance manager who's lived the problem.
</p>
