# FloorAlert — Product Specification

**Version:** 1.0  
**Date:** October 2026  
**Author:** Chris Carpenter (Maintenance Manager)  
**Status:** Draft for build planning

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [The Problem We're Solving](#2-the-problem-were-solving)
3. [Target Users & Roles](#3-target-users--roles)
4. [Core Features](#4-core-features)
5. [User Flows](#5-user-flows)
6. [Technical Requirements](#6-technical-requirements)
7. [MVP Scope](#7-mvp-scope)
8. [Pricing Model](#8-pricing-model)
9. [Competitive Differentiation](#9-competitive-differentiation)
10. [Success Metrics](#10-success-metrics)
11. [Risks & Mitigations](#11-risks--mitigations)
12. [Future Roadmap](#12-future-roadmap)

---

## 1. Product Overview

### What It Is

FloorAlert is a mobile-first maintenance communication and ticketing system built for industrial facilities, IT departments, and any organization where equipment downtime costs money. It replaces paper logs, verbal handoffs, and "I told the supervisor" with a structured, trackable, and fast reporting workflow.

### One-Line Pitch

**"Report a machine problem in 30 seconds from your phone. Get it fixed before it becomes a breakdown."**

### Value Proposition

| Stakeholder | Pain Today | FloorAlert Value |
|---|---|---|
| **Floor Workers** | Paper forms get lost; nothing seems to happen after reporting | 30-second mobile report; see status updates; know it was received |
| **Technicians** | Get problems verbally or via sticky notes; no context, no history | Structured work orders with photos, asset history, priority; assigned clearly |
| **Maintenance Managers** | Don't know what's broken until it's critical; no data for planning | Real-time dashboard; downtime analytics; recurring issue detection |
| **Plant/IT Management** | Can't justify maintenance budgets; no visibility into ROI | Downtime cost tracking; MTTR/MTBF metrics; compliance audit trail |

### Core Principles

1. **Dead simple for the reporter** — If it takes more than 30 seconds or more than 3 taps to report a problem, it's too complicated.
2. **No paper, no verbal handoffs** — Every issue is digital, timestamped, and tracked.
3. **Right person, right time** — Notifications go to the correct role based on issue type and severity, not a generic inbox.
4. **Works on the floor** — Mobile-first design that works on cheap Android phones, in gloves, in poor WiFi zones.
5. **Data that matters** — Not just ticket counts, but downtime, response time, and recurring patterns that drive decisions.

---

## 2. The Problem We're Solving

### Why Paper-Based Maintenance Reporting Fails

- **Workers don't fill out forms** — Paper is inconvenient, gets dirty, gets lost. Compliance drops below 30% within weeks.
- **Machines get ignored** — Without a visible tracking system, "minor" issues compound into catastrophic failures.
- **Communication breaks down** — Floor worker tells supervisor, supervisor tells maintenance, details get lost, nobody knows status.
- **No data for decisions** — Management can't see patterns (which machine breaks most, which shift has most issues, average response time).
- **Reactive, not preventive** — Everything is run-to-failure because there's no system to schedule and track preventive maintenance.

### What Existing Tools Get Wrong

- **Full EAM/CMMS systems** (SAP PM, Maximo, Fiix) — Overbuilt, expensive, take months to deploy, require dedicated admins. Floor workers hate them.
- **Generic ticketing** (Jira, ServiceNow) — Not designed for maintenance. No asset hierarchy, no downtime tracking, no mobile-first floor reporting.
- **Spreadsheets** — No notifications, no mobile access, no workflow, no accountability.

### The Gap

There's no tool that is simultaneously:
- Simple enough that a floor worker will actually use it
- Powerful enough that a maintenance manager can run a department on it
- Affordable enough for small-to-mid-size operations

FloorAlert fills that gap.

---

## 3. Target Users & Roles

### 3.1 Floor Worker (Reporter)

**Who:** Machine operators, production line workers, IT end-users, facility occupants  
**Tech comfort:** Low to moderate. Uses a smartphone daily but isn't a power user.  
**Key need:** Report a problem fast, without friction, and know someone got it.  
**Device:** Personal or company-issued smartphone (Android or iOS). Often wearing gloves, in noisy environments, on poor WiFi.

**Permissions:**
- Create incident reports
- View status of own reports
- Add photos/voice notes to reports
- View assigned asset status (read-only)
- Receive status updates on own reports

### 3.2 Technician (Responder)

**Who:** Maintenance technicians, IT support staff, facilities repair personnel  
**Tech comfort:** Moderate. Comfortable with mobile apps and basic software.  
**Key need:** Clear work orders with context, ability to update status, access to asset history.  
**Device:** Smartphone or tablet. Often moving between locations.

**Permissions:**
- View assigned work orders
- Accept/decline work orders
- Update work order status (in progress, waiting parts, complete)
- Add notes, photos, time logs to work orders
- View asset history and manuals
- Create ad-hoc work orders for issues they discover

### 3.3 Maintenance Manager

**Who:** Maintenance supervisors, IT managers, facility managers  
**Tech comfort:** High. Needs dashboards, reporting, and planning tools.  
**Key need:** Visibility into all work, ability to assign and prioritize, data for planning and budgeting.  
**Device:** Desktop/tablel primary, mobile for alerts.

**Permissions:**
- All technician permissions
- Create, assign, reassign, and prioritize work orders
- Define notification rules and escalation policies
- View all dashboards and reports
- Manage preventive maintenance schedules
- Manage asset registry
- Manage user accounts and role assignments
- Configure system settings

### 3.4 Administrator (System Admin)

**Who:** IT administrator or designated system owner  
**Tech comfort:** Very high.  
**Key need:** System configuration, integrations, user management at scale.

**Permissions:**
- All manager permissions
- System configuration (SMTP, SMS gateway, integrations)
- User provisioning and deactivation
- Data export and backup
- API key management
- Audit log access

---

## 4. Core Features

### 4.1 Floor-Level Incident Reporting

**The most important feature in the system. If this doesn't work, nothing else matters.**

#### Reporting Flow (Target: <30 seconds, <5 taps)

1. **Tap "Report Issue"** — Big button on home screen, always visible.
2. **Select Asset** — Scan QR code on machine, or search/select from list. Auto-suggests based on location.
3. **Select Issue Type** — Pre-defined categories with icons (e.g., 🔧 Mechanical, ⚡ Electrical, 💧 Leak, 🔥 Overheating, 🖥️ IT/Network, 🔒 Safety).
4. **Select Severity** — 3 levels only: Low (schedule it), Medium (fix today), High (stop production).
5. **Add Details (Optional)** — Photo, voice note, or one-line text. Not required.
6. **Submit** — Done. Confirmation with ticket number.

#### Key Design Decisions

- **QR code on every asset** — Eliminates searching and typing. Worker scans, asset is pre-filled. QR codes are cheap to print and laminate.
- **Voice notes over text** — Workers on a busy floor don't want to type. Voice-to-text or voice attachment.
- **Photo capture** — One picture is worth a thousand paper form fields. Camera opens directly in the app.
- **No required fields beyond asset + severity** — Every additional field reduces submission rate. Details are optional.
- **Offline mode** — If WiFi is down, report is queued locally and syncs when connection returns. Critical for industrial environments.

#### Issue Categories (Configurable per Organization)

| Category | Examples | Default Severity |
|---|---|---|
| Mechanical | Bearing noise, belt misalignment, vibration | Medium |
| Electrical | Power loss, sparking, breaker trip | High |
| Hydraulic/Pneumatic | Leak, pressure loss, cylinder failure | Medium |
| IT/Network | Computer down, network outage, printer broken | Variable |
| Facility | HVAC, lighting, plumbing, door | Low |
| Safety | Guard missing, emergency stop broken, spill | High |
| Quality | Sensor drift, calibration off | Medium |

### 4.2 Automatic Notifications

**The system's nervous system. Gets the right information to the right person at the right time.**

#### Notification Channels

| Channel | Use Case | Provider Options |
|---|---|---|
| **Push Notification** | Real-time alert on mobile | Firebase Cloud Messaging (FCM) / Apple Push (APNs) |
| **SMS** | High-severity alerts when push isn't seen | Twilio, AWS SNS |
| **Email** | Daily digests, reports, non-urgent updates | SendGrid, AWS SES, SMTP |
| **Dashboard** | Always-on visibility for managers | In-app real-time dashboard |

#### Routing Rules (Configurable)

Routing is based on: **Issue Category + Severity + Asset Location + Time of Day**

Example rules:

```
IF severity = High AND category = Safety
  → Immediately notify: Maintenance Manager (push + SMS), Safety Officer (push + SMS), Plant Manager (push)
  → Escalate to Plant Manager (SMS) if not acknowledged in 15 minutes

IF severity = High AND category = Electrical
  → Immediately notify: On-call Electrician (push + SMS), Maintenance Manager (push)
  → Escalate to Maintenance Manager (SMS) if not acknowledged in 30 minutes

IF severity = Medium
  → Notify: Maintenance Manager (push), assign to next available technician
  → Daily digest email if not resolved by end of shift

IF severity = Low
  → Add to backlog queue
  → Weekly digest email to Maintenance Manager
```

#### Escalation Engine

- Each severity level has a configurable acknowledgment timeout.
- If not acknowledged, notification escalates to the next role up.
- Escalation chain is configurable per organization.
- All escalations are logged for audit.

### 4.3 Work Order Management

**The operational core — turns reports into tracked, assigned, resolved work.**

#### Work Order Lifecycle

```
Reported → Triaged → Assigned → In Progress → On Hold → Resolved → Verified → Closed
                                      ↓
                                  Cancelled
```

#### Work Order Fields

| Field | Required | Description |
|---|---|---|
| WO Number | Auto | Unique identifier (e.g., WO-2026-001234) |
| Title | Auto (from report) | Short description |
| Asset | Auto (from report) | Linked asset ID |
| Issue Category | Auto (from report) | Category from reporting |
| Severity | Auto (from report) | Low / Medium / High |
| Status | Auto | Current lifecycle state |
| Reported By | Auto | Worker who reported |
| Reported At | Auto | Timestamp |
| Assigned To | Manager | Technician assigned |
| Assigned At | Manager | When assigned |
| Scheduled For | Optional | Planned date/time |
| Started At | Auto | When technician marks in-progress |
| Completed At | Auto | When technician marks resolved |
| Resolved By | Auto | Technician who resolved |
| Resolution Notes | Required on resolve | What was done |
| Parts Used | Optional | Parts/materials consumed |
| Labor Hours | Auto | Calculated from start to complete |
| Downtime Hours | Calculated | Asset downtime during this WO |
| Photos | Optional | Before/after photos |
| Linked Reports | Auto | Original incident report(s) |

#### Assignment Modes

- **Manual** — Manager assigns to specific technician.
- **Round-robin** — Auto-assign to next available technician in category.
- **Skill-based** — Match technician certifications to issue category.
- **Load-balanced** — Assign to technician with fewest open work orders.

#### Status Updates by Technician

- One-tap status change (In Progress → Resolved)
- Timer for labor tracking (starts when "In Progress" tapped)
- Quick-add parts, notes, photos
- "Waiting Parts" status with expected date — keeps WO open but flagged

### 4.4 Asset/Machine Tracking

**The registry of everything that can break.**

#### Asset Hierarchy

```
Site / Plant
  └── Area / Department
       └── Line / Zone
            └── Asset (machine)
                 └── Sub-asset (component)
```

#### Asset Record Fields

| Field | Description |
|---|---|
| Asset ID | Unique identifier (matches QR code) |
| Name | Human-readable name |
| Description | Brief description |
| Category | Mechanical, Electrical, IT, Facility, etc. |
| Location | Site → Area → Line → Position |
| Manufacturer / Model | OEM info |
| Serial Number | OEM serial |
| Install Date | When put into service |
| Warranty Expiry | Warranty end date |
| Status | Operational, Degraded, Down, Decommissioned |
| Criticality | Critical, Important, Standard (drives notification priority) |
| PM Schedule | Linked preventive maintenance schedule |
| Documents | Manuals, drawings, wiring diagrams (PDF/images) |
| Work History | All past work orders for this asset |
| Downtime Log | Accumulated downtime hours |
| Custom Fields | Organization-specific (e.g., voltage, capacity) |

#### Asset Status (Automatically Updated)

- **Operational** — No open work orders
- **Degraded** — Has open Medium/Low work orders
- **Down** — Has open High severity work order or reported as not functioning
- **Decommissioned** — Retired from service

#### QR Code Integration

- Every asset gets a unique QR code (generated by system, printed by organization).
- Scanning QR code from the app opens the asset page directly.
- QR code encodes: `https://app.flooralert.com/a/{asset_id}`
- Worker can scan → immediately report issue or view asset status.

### 4.5 Preventive Maintenance (PM) Scheduling

**Shifts from reactive to proactive maintenance.**

#### PM Schedule Types

| Type | Trigger | Example |
|---|---|---|
| **Time-based** | Every X days/weeks/months | "Lubricate conveyor bearings every 30 days" |
| **Usage-based** | Every X hours/cycles/units | "Change hydraulic oil every 2,000 operating hours" |
| **Condition-based** | Sensor threshold (future) | "Replace when vibration > X mm/s" |

#### PM Schedule Fields

- Schedule name and description
- Linked asset(s)
- Frequency (interval type + value)
- Estimated duration
- Assigned technician or team
- Required parts/materials (checklist)
- Instructions / procedure (rich text, images, video link)
- Due date (auto-calculated from last completion + frequency)

#### PM Workflow

1. System auto-generates PM work orders when due (configurable: 7 days before, day of, etc.).
2. PM work orders appear in technician's queue with "PM" badge.
3. Technician completes PM, checks off parts used, adds notes.
4. System records completion date, schedules next occurrence.
5. Overdue PMs are flagged on manager dashboard and escalate per policy.

#### PM Compliance Tracking

- % of PMs completed on time
- PMs overdue by asset/category
- PM-to-reactive ratio (higher PM compliance should reduce reactive work)

### 4.6 Reporting & Analytics

**Turns operational data into decisions.**

#### Standard Reports (Pre-built)

| Report | Description | Audience |
|---|---|---|
| **Downtime Summary** | Total downtime hours by asset, category, area, time period | Manager, Management |
| **MTTR** | Mean Time To Repair (by asset, technician, category) | Manager |
| **MTBF** | Mean Time Between Failures (by asset, category) | Manager |
| **Response Time** | Time from report to technician acknowledgment | Manager |
| **Resolution Time** | Time from report to resolution (by severity) | Manager |
| **Recurring Issues** | Assets/categories with most repeat reports | Manager |
| **Technician Performance** | WOs completed, avg resolution time, first-time-fix rate | Manager |
| **PM Compliance** | % PMs on time, overdue list | Manager |
| **Cost Analysis** | Labor hours, parts cost per asset/period | Manager, Finance |
| **Backlog Report** | Open work orders by age, severity, assignee | Manager |

#### Dashboard Views

**Manager Dashboard (Desktop):**
- Real-time KPIs: Open WOs, Critical Issues, Assets Down, MTTR (this month)
- Work order board (Kanban: To Do / In Progress / Waiting Parts / Done)
- Asset status overview (color-coded: green/yellow/red/gray)
- Recent activity feed
- Downtime trend chart (daily/weekly/monthly)

**Technician Dashboard (Mobile):**
- My assigned work orders (sorted by priority)
- Due today / overdue sections
- Quick status update buttons
- Asset history when viewing a WO

**Floor Worker View (Mobile):**
- My submitted reports with current status
- Asset status lookup (scan QR → see if machine is known to be down)

#### Custom Report Builder (Post-MVP)

- Drag-and-drop field selection
- Filter by date range, asset, category, technician, severity
- Export to CSV/PDF
- Scheduled email delivery

### 4.7 Additional Features

#### Shift Handoff Report

- Auto-generated summary at shift change: open WOs, critical issues, assets down, PMs due.
- Emailed to incoming shift supervisor and maintenance manager.

#### Parts Inventory (Basic)

- Track parts used per work order.
- Low-stock alerts (configurable threshold).
- Parts cost rollup per asset/WO.
- (Full inventory management deferred to post-MVP.)

#### Document Attachments

- Attach manuals, SOPs, wiring diagrams to assets.
- Attach photos/videos to work orders and reports.
- Support: PDF, JPG, PNG, MP4.

#### Audit Log

- Every action logged: who, what, when, from where.
- Immutable log for compliance (ISO, OSHA, food safety, etc.).
- Filterable by user, asset, date range, action type.

#### Multi-Site Support

- Organizations can have multiple sites/plants.
- Users can be scoped to specific sites.
- Cross-site reporting and benchmarking (post-MVP).

---

## 5. User Flows

### 5.1 Flow: Floor Worker Reports an Issue

```
┌─────────────────────────────────────────────────────────────┐
│ FLOOR WORKER                                                 │
│                                                              │
│  1. Opens FloorAlert app on phone                           │
│  2. Taps big red "Report Issue" button                      │
│  3. Scans QR code on machine (or selects from list)         │
│  4. Taps issue category icon (e.g., 🔧 Mechanical)           │
│  5. Taps severity (Low / Medium / High)                     │
│  6. [Optional] Takes photo or records voice note            │
│  7. Taps "Submit"                                           │
│  8. Sees confirmation: "Report #RPT-001234 submitted"      │
│     with estimated response time based on severity           │
│                                                              │
│  TOTAL TIME: ~20-30 seconds                                 │
│  TOTAL TAPS: 5-7                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ SYSTEM (Automated)                                           │
│                                                              │
│  1. Creates incident report record                          │
│  2. Generates ticket number                                 │
│  3. Looks up routing rules for (category + severity)        │
│  4. Sends push notification to Maintenance Manager          │
│  5. If High severity: also SMS to manager + on-call tech    │
│  6. If Safety: also notify Safety Officer                   │
│  7. Starts escalation timer (15-30 min based on severity)   │
│  8. Updates asset status to "Degraded" or "Down"            │
│  9. Adds to manager dashboard real-time feed                │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Flow: Manager Triage and Assignment

```
┌─────────────────────────────────────────────────────────────┐
│ MAINTENANCE MANAGER (on desktop or mobile)                   │
│                                                              │
│  1. Receives push notification: "New High severity report   │
│     — Conveyor Line 3 — Bearing noise"                      │
│  2. Opens notification → sees report details               │
│  3. Reviews photo/voice note attached by worker            │
│  4. Opens asset history → sees this conveyor had 3 similar  │
│     reports in past 60 days (recurring issue flag)          │
│  5. Creates work order from report (auto-fills asset,      │
│     category, severity, description)                        │
│  6. Assigns to technician (manual or auto-suggest)         │
│  7. Sets priority and scheduled date                        │
│  8. Adds note: "Check bearing temp, possibly replace"       │
│                                                              │
│  Technician receives push notification with WO details      │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Flow: Technician Resolves Work Order

```
┌─────────────────────────────────────────────────────────────┐
│ TECHNICIAN (on mobile)                                       │
│                                                              │
│  1. Receives push: "WO-001234 assigned — Conveyor bearing"  │
│  2. Opens WO → sees asset details, history, report photos   │
│  3. Navigates to asset (sees QR code to confirm location)   │
│  4. Taps "Start Work" → timer starts                        │
│  5. Performs repair                                         │
│  6. Taps "Add Note" → types or dictates resolution          │
│  7. Takes "after" photo                                     │
│  8. Taps "Mark Resolved"                                    │
│                                                              │
│  System:                                                     │
│  - Stops labor timer, calculates hours                      │
│  - Updates asset status to "Operational"                    │
│  - Notifies reporter: "Your report #RPT-001234 has been    │
│    resolved. Conveyor Line 3 is back online."               │
│  - Logs resolution for analytics                            │
│  - If linked to PM schedule, schedules next PM              │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 Flow: Escalation (Unacknowledged High Severity)

```
┌─────────────────────────────────────────────────────────────┐
│ T+0 min:    High severity report submitted                  │
│             → Push + SMS to Maintenance Manager             │
│             → Push to On-Call Technician                    │
│                                                              │
│ T+15 min:   No acknowledgment from manager                  │
│             → Escalation: SMS to Plant Manager              │
│             → Flagged red on dashboard                      │
│                                                              │
│ T+30 min:   Still no acknowledgment                         │
│             → Escalation: Phone call (via Twilio) to        │
│               Plant Manager                                 │
│             → Incident logged as SLA breach                 │
│                                                              │
│ T+45 min:   If still unacknowledged                          │
│             → Escalation: SMS to Operations Director        │
│             → Incident escalated to executive dashboard     │
└─────────────────────────────────────────────────────────────┘
```

### 5.5 Flow: Preventive Maintenance Cycle

```
┌─────────────────────────────────────────────────────────────┐
│ SYSTEM (Automated)                                           │
│                                                              │
│  1. Nightly cron checks PM schedules                        │
│  2. Finds PMs due within next 7 days                        │
│  3. Auto-creates PM work orders                             │
│  4. Assigns to technician based on schedule config          │
│  5. Sends push notification: "PM due tomorrow:             │
│     Hydraulic press — oil change"                           │
│                                                              │
│ TECHNICIAN                                                   │
│                                                              │
│  6. Sees PM in queue with "PM" badge                        │
│  7. Opens PM → sees procedure steps, required parts,        │
│     estimated duration                                      │
│  8. Completes PM → checks off steps, adds notes             │
│  9. System records completion, schedules next PM             │
│                                                              │
│ MANAGER                                                      │
│                                                              │
│  10. Sees PM compliance on dashboard: 94% on-time          │
│  11. Flags overdue PMs for follow-up                        │
│  12. Reviews PM-to-reactive ratio trending                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Technical Requirements

### 6.1 Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                        CLIENTS                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Mobile App  │  │  Mobile App  │  │   Web App    │   │
│  │  (Reporter)  │  │(Technician)  │  │  (Manager)   │   │
│  │  Android/iOS │  │  Android/iOS │  │   Desktop    │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                  │            │
│         └─────────────────┼──────────────────┘            │
│                           │                               │
│                    ┌──────▼──────┐                        │
│                    │  API Layer  │                        │
│                    │  (REST/     │                        │
│                    │   WebSocket)│                        │
│                    └──────┬──────┘                        │
│                           │                               │
│              ┌────────────┼────────────┐                  │
│              │            │            │                   │
│        ┌─────▼─────┐ ┌───▼────┐ ┌────▼─────┐            │
│        │  Auth     │ │ Core   │ │ Notifi-  │            │
│        │  Service  │ │ APIs   │ │ cation   │            │
│        │  (JWT)    │ │        │ │ Service  │            │
│        └───────────┘ └───┬────┘ └────┬─────┘            │
│                          │           │                   │
│                    ┌─────▼───────────▼─────┐             │
│                    │    Database Layer      │             │
│                    │  (PostgreSQL + Redis)  │             │
│                    └────────────────────────┘             │
└──────────────────────────────────────────────────────────┘
```

### 6.2 Technology Stack (Recommended)

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend (Web)** | React + TypeScript + Tailwind CSS | Fast, responsive, component-based. Tailwind for rapid UI iteration. |
| **Mobile App** | React Native (Expo) | Single codebase for iOS + Android. OTA updates without app store. Camera, push notifications, offline storage built-in. |
| **Backend API** | Python (FastAPI) or Node.js (NestJS) | FastAPI: async, type-fast, great for I/O-heavy notification workloads. NestJS: enterprise structure, TypeScript end-to-end. |
| **Database** | PostgreSQL | Robust, JSON support for flexible asset fields, full-text search, row-level security. |
| **Cache / Queue** | Redis | Session cache, rate limiting, Celery/BullMQ job queue for notifications and PM generation. |
| **Real-time** | WebSocket (Socket.io) or Server-Sent Events | Live dashboard updates, push status changes to connected clients. |
| **File Storage** | S3-compatible (AWS S3, MinIO, or Cloudflare R2) | Photos, voice notes, documents. |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | Free, reliable, works on both iOS and Android. |
| **SMS** | Twilio | Reliable global SMS, programmable voice for escalation calls. |
| **Email** | SendGrid or AWS SES | Transactional email, templates, deliverability. |
| **Hosting** | Docker on AWS/GCP/DigitalOcean | Containerized for portability. Start single-server, scale horizontally. |
| **CI/CD** | GitHub Actions | Automated testing, building, deployment. |
| **Monitoring** | Sentry (errors) + UptimeRobot (uptime) | Catch issues before users do. |

### 6.3 API Design (Key Endpoints)

```
# Authentication
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password

# Incident Reports
POST   /api/v1/reports                    # Create report (floor worker)
GET    /api/v1/reports                    # List reports (filtered by role)
GET    /api/v1/reports/{id}               # Get report details
PATCH  /api/v1/reports/{id}               # Update report (add notes)

# Work Orders
POST   /api/v1/work-orders                # Create WO (from report or manual)
GET    /api/v1/work-orders                # List WOs (filtered by role)
GET    /api/v1/work-orders/{id}           # Get WO details
PATCH  /api/v1/work-orders/{id}           # Update WO (status, assignment, notes)
POST   /api/v1/work-orders/{id}/start     # Start work (timer starts)
POST   /api/v1/work-orders/{id}/resolve   # Mark resolved
POST   /api/v1/work-orders/{id}/photos    # Upload photos

# Assets
GET    /api/v1/assets                     # List assets (with filters)
GET    /api/v1/assets/{id}                # Get asset details + history
POST   /api/v1/assets                     # Create asset (manager)
PATCH  /api/v1/assets/{id}                # Update asset
GET    /api/v1/assets/{id}/qrcode         # Generate QR code image

# Preventive Maintenance
GET    /api/v1/pm-schedules               # List PM schedules
POST   /api/v1/pm-schedules               # Create PM schedule
GET    /api/v1/pm-schedules/due          # List due/overdue PMs
POST   /api/v1/pm-schedules/{id}/complete # Mark PM complete

# Notifications
GET    /api/v1/notifications              # List notifications for current user
PATCH  /api/v1/notifications/{id}/read    # Mark as read
GET    /api/v1/notification-rules         # List routing rules (manager)
POST   /api/v1/notification-rules         # Create routing rule (manager)

# Reports & Analytics
GET    /api/v1/analytics/downtime         # Downtime metrics
GET    /api/v1/analytics/mttr             # MTTR metrics
GET    /api/v1/analytics/mtbf             # MTBF metrics
GET    /api/v1/analytics/response-time    # Response time metrics
GET    /api/v1/analytics/recurring        # Recurring issue analysis
GET    /api/v1/analytics/pm-compliance    # PM compliance metrics
GET    /api/v1/analytics/technician-perf  # Technician performance

# Users & Teams
GET    /api/v1/users                      # List users (manager/admin)
POST   /api/v1/users                      # Create user (admin)
PATCH  /api/v1/users/{id}                 # Update user
GET    /api/v1/teams                      # List teams
```

### 6.4 Data Models (Key Entities)

```
User
├── id, email, name, phone, role, team_id
├── sites[] (multi-site)
├── notification_preferences (push, sms, email toggles)
└── created_at, updated_at, last_login

Asset
├── id, asset_id (unique), name, description
├── category, status, criticality
├── site_id, area_id, line_id, location_notes
├── manufacturer, model, serial_number
├── install_date, warranty_expiry
├── qr_code_url
├── documents[] (S3 keys)
├── custom_fields (JSONB)
└── created_at, updated_at

IncidentReport
├── id, report_number (RPT-XXXXXX)
├── asset_id → Asset
├── reported_by → User
├── category, severity
├── description, voice_note_url, photos[]
├── status (open, converted_to_wo, cancelled)
├── work_order_id → WorkOrder (nullable)
├── created_at, updated_at

WorkOrder
├── id, wo_number (WO-XXXXXX)
├── report_id → IncidentReport (nullable)
├── asset_id → Asset
├── title, description
├── category, severity, status
├── assigned_to → User
├── reported_by → User
├── scheduled_for, started_at, completed_at
├── resolution_notes, photos[]
├── labor_hours (calculated), downtime_hours (calculated)
├── parts_used[] (part_id, quantity, cost)
├── pm_schedule_id → PMSchedule (nullable)
├── created_at, updated_at

PMSchedule
├── id, name, description
├── asset_id → Asset
├── frequency_type (time, usage), frequency_value
├── estimated_duration_hours
├── assigned_to → User
├── procedure_steps[], required_parts[]
├── last_completed_at, next_due_at
├── is_active
└── created_at, updated_at

NotificationRule
├── id, name
├── trigger_category, trigger_severity
├── trigger_site_id (nullable = all sites)
├── notify_roles[] (which roles to notify)
├── notify_users[] (specific users)
├── channels[] (push, sms, email)
├── escalation_timeout_minutes
├── escalation_target_role
└── is_active

NotificationLog
├── id, user_id → User
├── type (report, wo_assigned, wo_resolved, escalation, pm_due)
├── channel (push, sms, email)
├── status (sent, delivered, failed)
├── content, sent_at, delivered_at
```

### 6.5 Non-Functional Requirements

| Requirement | Target |
|---|---|
| **Availability** | 99.5% uptime (self-hosted option: best effort) |
| **Report Submission** | <3 seconds end-to-end (excluding network) |
| **Notification Delivery** | Push: <5 seconds; SMS: <30 seconds; Email: <60 seconds |
| **Page Load** | <2 seconds (web); <1 second (mobile app screen transitions) |
| **Offline Support** | Reports queued locally, sync on reconnect (up to 24 hours) |
| **Concurrent Users** | 500 per instance (single server); horizontally scalable |
| **Data Retention** | Minimum 7 years (configurable) |
| **Security** | HTTPS only, bcrypt password hashing, JWT tokens with refresh, RBAC, audit logging |
| **Backups** | Daily automated backups, 30-day retention, tested restore monthly |
| **GDPR/PII** | Data export and deletion endpoints, consent tracking |

### 6.6 Integration Points

| Integration | Purpose | Priority |
|---|---|---|
| **Twilio** | SMS notifications, voice calls for escalation | MVP |
| **SendGrid / SES** | Email notifications, digests, reports | MVP |
| **Firebase (FCM)** | Push notifications to mobile | MVP |
| **LDAP / Active Directory** | Enterprise SSO and user sync | Post-MVP |
| **OAuth (Google, Microsoft)** | SSO for smaller organizations | Post-MVP |
| **ERP Systems** (SAP, Oracle) | Sync asset registry, work orders, cost data | Post-MVP |
| **IoT Sensors** (MQTT) | Condition-based monitoring triggers | Future |
| **Slack / Teams** | Notification channel for IT teams | Post-MVP |
| **Accounting Software** (QuickBooks) | Cost tracking, parts purchasing | Future |

---

## 7. MVP Scope

### 7.1 MVP (Weeks 1–8) — "Get Reports Flowing"

**Goal:** Prove that floor workers will actually use the system and managers get value.

| Feature | Included | Notes |
|---|---|---|
| User roles (all 4) | ✅ | Basic RBAC |
| Mobile app (React Native) | ✅ | iOS + Android |
| Incident reporting | ✅ | QR scan, category, severity, photo, voice |
| Push notifications | ✅ | FCM for all roles |
| SMS notifications | ✅ | Twilio, High severity only |
| Email notifications | ✅ | Daily digest, not real-time |
| Work order creation | ✅ | From reports + manual creation |
| Work order assignment | ✅ | Manual only (no auto-assign) |
| Work order status updates | ✅ | Start, resolve, notes, photos |
| Asset registry | ✅ | CRUD, QR code generation, status tracking |
| Asset history | ✅ | Work order history per asset |
| Manager dashboard | ✅ | Web-based, real-time KPIs |
| Technician mobile view | ✅ | Assigned WOs, status updates |
| Basic reports | ✅ | Downtime, MTTR, response time, backlog |
| Audit log | ✅ | All actions logged |
| Offline mode | ✅ | Queue reports, sync on reconnect |
| PM scheduling | ❌ | Deferred to V1.1 |
| Escalation engine | ❌ | Deferred to V1.1 (basic timeout only) |
| Parts inventory | ❌ | Deferred to V1.2 |
| Custom report builder | ❌ | Deferred to V1.2 |
| Multi-site | ❌ | Deferred to V1.3 |
| SSO / LDAP | ❌ | Deferred to V1.2 |
| Slack/Teams integration | ❌ | Deferred to V1.2 |
| IoT sensor integration | ❌ | Future |

### 7.2 V1.1 (Weeks 9–12) — "Preventive & Escalation"

- Preventive maintenance scheduling (time-based only)
- Escalation engine with configurable rules
- Auto-assignment (round-robin, skill-based)
- Recurring issue detection and flagging
- PM compliance dashboard
- Shift handoff reports

### 7.3 V1.2 (Weeks 13–18) — "Enterprise Ready"

- Parts inventory (basic)
- Custom report builder
- Slack / Teams notifications
- SSO (Google, Microsoft, LDAP)
- Multi-site support
- Data export (CSV, API)
- Advanced analytics (cost per asset, trend analysis)

### 7.4 V2.0 (Future) — "Intelligent Maintenance"

- IoT sensor integration (condition-based monitoring)
- AI-powered failure prediction
- Predictive analytics (which asset fails next)
- Mobile AR for asset identification and repair guidance
- Integration with ERP systems
- Benchmarking across sites

---

## 8. Pricing Model

### 8.1 Pricing Philosophy

- **Per-user pricing** — Simple, predictable, scales with organization size.
- **Free tier** — Get small teams started, prove value, upgrade when hooked.
- **No per-ticket fees** — Penalizing usage defeats the purpose. We want more reporting.
- **Annual discount** — 20% off for annual commitment.

### 8.2 Tiers

| Tier | Price | Users | Best For |
|---|---|---|---|
| **Free** | $0 | Up to 5 | Small teams, trials, single-site pilots |
| **Professional** | $15/user/month | Unlimited | Small-to-mid operations (5–50 users) |
| **Enterprise** | $25/user/month | Unlimited | Multi-site, advanced features, SSO |
| **Self-Hosted** | Custom (one-time + annual support) | Unlimited | Regulated industries, air-gapped environments |

### 8.3 Feature Comparison

| Feature | Free | Professional | Enterprise |
|---|---|---|---|
| Incident reporting | ✅ | ✅ | ✅ |
| Push notifications | ✅ | ✅ | ✅ |
| SMS notifications | ❌ | ✅ (100/month) | ✅ (unlimited) |
| Email notifications | ✅ (digest only) | ✅ (real-time) | ✅ (real-time) |
| Work order management | ✅ | ✅ | ✅ |
| Asset tracking (QR) | ✅ (up to 25 assets) | ✅ (unlimited) | ✅ (unlimited) |
| Preventive maintenance | ❌ | ✅ | ✅ |
| Escalation engine | ❌ | ✅ | ✅ |
| Basic reports | ✅ | ✅ | ✅ |
| Custom reports | ❌ | ❌ | ✅ |
| Parts inventory | ❌ | ✅ | ✅ |
| Multi-site | ❌ | ❌ | ✅ |
| SSO / LDAP | ❌ | ❌ | ✅ |
| Slack / Teams | ❌ | ❌ | ✅ |
| API access | ❌ | ✅ (read) | ✅ (read/write) |
| Priority support | ❌ | Email | Phone + email |
| Data retention | 1 year | 7 years | Unlimited |

### 8.4 Add-Ons

| Add-On | Price | Description |
|---|---|---|
| SMS pack | $20/100 SMS | Additional SMS beyond plan |
| Implementation service | $500 one-time | Asset setup, QR codes, user training |
| Custom integrations | Custom | ERP, IoT, or proprietary system connectors |
| Additional data retention | $500/year/5 years | Beyond standard 7 years |

### 8.5 Target ACV

| Segment | Users | Tier | Monthly | Annual |
|---|---|---|---|---|
| Small manufacturer | 10 | Professional | $150 | $1,440 |
| Mid-size manufacturer | 30 | Professional | $450 | $4,320 |
| Multi-site operation | 100 | Enterprise | $2,500 | $24,000 |
| Enterprise (self-hosted) | 500+ | Self-hosted | Custom | Custom |

---

## 9. Competitive Differentiation

### 9.1 vs. Full CMMS (Fiix, UpKeep, Limble)

| Dimension | CMMS Tools | FloorAlert |
|---|---|---|
| **Target user** | Maintenance manager | Floor worker + manager |
| **Reporting complexity** | Multi-form, many fields | 5-tap, 30-second report |
| **Mobile experience** | Secondary (web-first) | Primary (mobile-first) |
| **Setup time** | Weeks to months | Hours to days |
| **Cost** | $50–100/user/month | $15–25/user/month |
| **Asset complexity** | Deep hierarchy, depreciation | Simple, practical hierarchy |
| **Best for** | Organizations with dedicated maintenance teams | Organizations where reporting is the bottleneck |

### 9.2 vs. Generic Ticketing (Jira, ServiceNow, Zendesk)

| Dimension | Generic Ticketing | FloorAlert |
|---|---|---|
| **Asset tracking** | None or plugin | Native, QR-based |
| **Downtime tracking** | Manual | Automatic |
| **PM scheduling** | None | Native |
| **Notification routing** | Generic (assignee only) | Category + severity + role-based |
| **Mobile reporting** | Poor (designed for agents) | Excellent (designed for floor workers) |
| **Industry fit** | IT service management | Industrial + IT maintenance |

### 9.3 FloorAlert's Unfair Advantages

1. **Built by a maintenance manager who's lived the problem** — Not designed in a vacuum. Every feature addresses a real failure mode observed in production environments.
2. **30-second reporting is the north star** — Every design decision is tested against "will this make reporting faster or slower?"
3. **QR-code-first asset identification** — Eliminates the biggest friction point (which machine is broken?). Others treat QR as an add-on; we make it core.
4. **Notification intelligence** — Not just "notify the assignee" but "notify the right person based on what broke, how bad, and when."
5. **Pragmatic MVP** — We don't try to be everything. We solve the reporting → resolution loop perfectly, then expand.
6. **Price disruption** — Half the cost of CMMS tools with better mobile experience. Easy sell to management.

---

## 10. Success Metrics

### 10.1 Product Metrics

| Metric | Target (6 months post-launch) | Target (12 months) |
|---|---|---|
| **Report submission rate** | >80% of incidents reported (vs. <30% paper) | >90% |
| **Median report time** | <30 seconds | <20 seconds |
| **Daily active users (reporters)** | >60% of floor workers | >75% |
| **Work order resolution rate** | >90% within SLA | >95% |
| **Median response time (High)** | <15 minutes | <10 minutes |
| **Median resolution time (High)** | <4 hours | <2 hours |
| **PM compliance** | N/A (post-MVP) | >85% on-time |
| **Recurring issue reduction** | Baseline established | 20% reduction in repeat failures |

### 10.2 Business Metrics

| Metric | Target |
|---|---|
| **Free-to-paid conversion** | >15% |
| **Monthly churn** | <3% |
| **Net Promoter Score** | >40 |
| **Customer acquisition cost** | <$200 |
| **Lifetime value** | >$3,000 |
| **Time-to-value** | <1 day (first report submitted) |

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Floor workers don't adopt the app** | Medium | Critical | Involve workers in design/testing. Keep app dead simple. Provide training sessions. Show them status updates (closure loop). |
| **WiFi dead zones on the floor** | High | Medium | Offline mode is MVP-critical. Queue reports locally. Test in real environments during pilot. |
| **Notification fatigue** | Medium | Medium | Configurable per-user notification preferences. Smart batching for Low severity. Respect quiet hours. |
| **QR codes get damaged/lost** | Medium | Low | QR codes are cheap to reprint. Asset search by name/location is always available as fallback. |
| **Existing CMMS investment** | Medium | High | Position as complementary (reporting layer) not replacement. Offer import/export. |
| **Data migration from paper/Excel** | High | Medium | Provide CSV import tool. Offer implementation service. Start with current assets only, backfill history over time. |
| **Multi-site complexity** | Medium | Medium | Defer to V1.3. Design data model with site_id from day one. |
| **Security breach** | Low | Critical | HTTPS, bcrypt, JWT with short expiry, RBAC, audit logging, regular dependency updates, penetration testing before launch. |

---

## 12. Future Roadmap

### Near-Term (6–12 months)
- [ ] IoT sensor integration (vibration, temperature, current) for condition-based triggers
- [ ] AI-powered failure prediction (which asset is likely to fail next based on patterns)
- [ ] Mobile AR overlay for asset identification and repair guidance
- [ ] Integration with popular ERP systems (SAP, Oracle, NetSuite)
- [ ] Advanced analytics: cost per asset, total cost of ownership, maintenance ROI

### Medium-Term (1–2 years)
- [ ] Digital twin integration for critical assets
- [ ] Automated parts purchasing (integrate with suppliers)
- [ ] Workforce management: certification tracking, skill matrix, training records
- [ ] Regulatory compliance packages (OSHA, FDA, ISO 55000)
- [ ] Marketplace for third-party integrations and custom reports

### Long-Term (2+ years)
- [ ] Industry-specific templates (food & beverage, pharma, automotive, data centers)
- [ ] Benchmarking across customers (anonymized industry benchmarks)
- [ ] Autonomous maintenance scheduling (AI optimizes PM schedules based on production plans, asset criticality, and resource availability)
- [ ] Integration with production planning systems (schedule maintenance during planned downtime)

---

## Appendix A: Glossary

| Term | Definition |
|---|---|
| **CMMS** | Computerized Maintenance Management System |
| **EAM** | Enterprise Asset Management |
| **MTTR** | Mean Time To Repair — average time to fix a failed asset |
| **MTBF** | Mean Time Between Failures — average time between asset failures |
| **PM** | Preventive Maintenance — scheduled maintenance to prevent failures |
| **WO** | Work Order — a tracked task to perform maintenance |
| **SLA** | Service Level Agreement — committed response/resolution time |
| **QR Code** | Quick Response code — 2D barcode scanned by phone camera |
| **RBAC** | Role-Based Access Control — permissions based on user role |

## Appendix B: Open Questions for Pilot

1. What is the average number of incidents per shift that currently go unreported?
2. What devices do floor workers have? (Personal phone, company phone, shared tablet?)
3. What is the WiFi coverage like on the production floor?
4. What existing systems need to integrate? (ERP, HR, production scheduling?)
5. What compliance requirements apply? (OSHA, ISO, FDA, internal audit?)
6. Who is the economic buyer? (Plant manager, maintenance director, CFO?)
7. What is the current annual maintenance budget? (For ROI calculation)
8. What is the cost of one hour of unplanned downtime? (For ROI calculation)

---

*End of specification.*
