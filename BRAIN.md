# BRAIN.md - Control X Project Master Context

## 1. MANDATORY RULE
Before modifying, adding, deleting, refactoring, or deploying anything, ALWAYS read `BRAIN.md` first. Never make assumptions about how the project works when the information can be found in this file or existing code.

---

## 2. PROJECT OVERVIEW & CURRENT ARCHITECTURE
* **Project Purpose:** High-end boutique creative & technology agency web platform offering interactive 3D brand experiences, portfolio showcase, public client inquiry management, and automated executive consultation bookings with fault-tolerant payment gating.
* **Current Architecture:**
  * **Frontend Framework:** Next.js 14 (App Router), React 18, Three.js / React Three Fiber / Drei for 3D visual experiences, Vanilla CSS / CSS Modules for modular styling.
  * **Backend & Database:** Supabase (PostgreSQL 15), Supabase Auth (JWT sessions), Row Level Security (RLS) policies, Next.js Server Components and Edge/Node Route Handlers (`src/app/api/*`), Supabase Edge Functions (Deno).
  * **Payment Infrastructure:** Cashfree Payments Payment Gateway (v2023-08-01 API) with server-side SDK checkout, idempotency key generation, and webhook state synchronization.
  * **Notifications:** Telegram Bot API (direct multi-chat push alerts with Indian Standard Time timestamps) + Nodemailer SMTP fallback + Supabase Edge Function (`telegram-bot`).

---

## 3. DATABASE & SUPABASE

### Tables & Relationships
1. **`public.profiles`**:
   * Extends `auth.users(id)` (ON DELETE CASCADE).
   * Columns: `id` (UUID, PK), `email` (TEXT), `role` (TEXT: `'user' | 'admin' | 'client' | 'creator'`), `created_at`, `updated_at`.
   * Auto-created on user signup via `handle_new_user()` trigger.
2. **`public.projects`**:
   * Portfolio showcase items for landing page.
   * Columns: `id` (UUID, PK), `title`, `category`, `description`, `image_url`, `live_url`, `tag_line`, `sort_order` (SMALLINT), `is_published` (BOOLEAN), `created_at`.
3. **`public.contact_messages`**:
   * Public inquiry and contact form storage.
   * Columns: `id` (UUID, PK), `name`, `email`, `message`, `status` (`'new' | 'read' | 'replied' | 'archived'`), `admin_notes` (TEXT), `created_at`.
4. **`public.bookings`**:
   * Fault-tolerant state machine tracking consultations and Cashfree orders.
   * Columns:
     * `id` (UUID, PK)
     * `user_id` (UUID, FK -> `auth.users`)
     * `idempotency_key` (UUID, UNIQUE)
     * `cashfree_order_id` (TEXT, UNIQUE)
     * `service_name` (TEXT, default: `'1-Hour Executive Consultation'`)
     * `amount` (DECIMAL(10,2), default: `5000.00`)
     * `currency` (TEXT, default: `'INR'`)
     * `customer_name`, `customer_email`, `customer_phone` (TEXT)
     * `status` (TEXT, Payment Status: `'draft' | 'pending_payment' | 'confirmed' | 'failed' | 'cancelled' | 'refunded'`)
     * `contact_status` (TEXT, CRM Status: `'Pending' | 'Not Contacted' | 'Contacted' | 'Callback Required' | 'No Response'`)
     * `booking_status` (TEXT, Operational Consultation Status: `'Confirmed' | 'Completed' | 'Cancelled'`)
     * `admin_notes` (TEXT)
     * `follow_up_at` (TIMESTAMPTZ)
     * `email_sent` (BOOLEAN)
     * `ip_address` (TEXT), `user_agent` (TEXT)
     * `created_at`, `updated_at` (TIMESTAMPTZ)
5. **`public.booking_history`**:
   * Audit trail for CRM changes, status shifts, notes, and stale payment retirements.
   * Columns: `id` (UUID, PK), `booking_id` (UUID, FK -> `bookings`), `action` (TEXT), `old_status` (TEXT), `new_status` (TEXT), `note` (TEXT), `admin_id` (UUID, FK -> `auth.users`), `created_at` (TIMESTAMPTZ).
6. **`public.customer_blocks`**:
   * Multi-identifier blacklist preventing abuse.
   * Columns: `id` (UUID, PK), `user_id` (UUID, FK -> `auth.users`), `email` (TEXT), `phone` (TEXT), `ip_address` (TEXT), `user_agent` (TEXT), `reason` (TEXT), `blocked_by` (UUID, FK -> `auth.users`), `created_at` (TIMESTAMPTZ).

### Supabase RLS Policies
* `profiles`: Users can SELECT and UPDATE only their own profile (`auth.uid() = id`).
* `projects`: Public visitors can SELECT only published projects (`is_published = true`).
* `contact_messages`: Public (`anon`, `authenticated`) can INSERT. Only `authenticated` admins can SELECT/UPDATE.
* `bookings`: Users can SELECT/INSERT/UPDATE their own bookings (`auth.uid() = user_id`). Server admin client (`SUPABASE_SERVICE_ROLE_KEY`) bypasses RLS for system operations.
* `booking_history`: Only admins can SELECT and INSERT (`EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')`).
* `customer_blocks`: Only admins can manage blocks (ALL operations).

### Environment Variables & Secrets
* `NEXT_PUBLIC_SUPABASE_URL`: Public Supabase API project URL.
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public Supabase client anonymous API key.
* `SUPABASE_SERVICE_ROLE_KEY`: Privileged server-side key for administrative database operations (bypasses RLS).
* `CASHFREE_APP_ID`: Cashfree API Client / App ID.
* `CASHFREE_SECRET_KEY`: Cashfree API Secret Key.
* `CASHFREE_BASE_URL`: Cashfree API Base URL (`https://sandbox.cashfree.com/pg` or `https://api.cashfree.com/pg`).
* `NEXT_PUBLIC_CASHFREE_ENV`: Cashfree SDK environment (`TEST` or `PRODUCTION`).
* `TELEGRAM_BOT_TOKEN`: Telegram Bot API token for push alerts.
* `TELEGRAM_CHAT_ID`: Comma-separated list of target Telegram Admin Chat IDs.
* `EMAIL_USER`: Gmail / SMTP sender email address for admin and client transaction receipts.
* `EMAIL_APP_PASSWORD`: SMTP App Password for transactional emails.
* `RESEND_API_KEY`: Resend API key (optional email fallback).

---

## 4. SYSTEM FLOWS

### Authentication Flow (Signup / Login)
1. User enters email and password on `/login`.
2. Interactive Cat stage animates based on input focus, typing, masking, and validation.
3. Supabase Auth `signInWithPassword()` or `signUp()` is executed client-side.
4. On `signUp()`, PostgreSQL trigger `on_auth_user_created` creates a matching row in `public.profiles`.
5. If email confirmation is enabled, UI displays an instruction to verify email before logging in.
6. Middleware (`src/middleware.ts`) refreshes JWT session cookies on each request and guards protected routes (`/dashboard`, `/payment`, `/admin`).

### Booking Creation Flow
1. Authenticated user clicks *"Book Consultation"* on `/dashboard`.
2. Client calls `POST /api/payments/create-order`.
3. Server captures client IP and User-Agent headers.
4. **Pre-Booking Block Check**: Verifies user ID, email, or phone is not listed in `customer_blocks`. Returns 403 Forbidden if blocked.
5. **Stale Payment Cleanup**: Automatically retires abandoned `pending_payment` bookings older than 30 minutes to `failed` and logs to `booking_history`.
6. **Strict Active Check**: Queries database for existing `confirmed` bookings where `booking_status` is not `Completed` and not `Cancelled`. Returns 409 Conflict if active booking exists.
7. Server generates `crypto.randomUUID()` for `idempotency_key` and creates a `draft` booking in Supabase.
8. Server requests Cashfree PG to create an order session (`payment_session_id`).
9. Server updates booking status to `pending_payment` and stores `cashfree_order_id`.
10. Returns `payment_session_id` to client to mount Cashfree JS SDK modal.

### Booking Eligibility & Rebooking Rules
* **Active Booking**: A user is only blocked if they hold a booking with `status = 'confirmed'` AND (`booking_status IS NULL` OR `booking_status = 'Confirmed'`).
* **Completed Rebooking**: When a consultation is finished (`booking_status = 'Completed'`), the user is immediately eligible to book again.
* **Cancelled Rebooking**: When a consultation is cancelled (`booking_status = 'Cancelled'`), the user is immediately eligible to book again.
* **Failed / Abandoned Rebooking**: When a payment attempt fails or times out, the user can immediately retry.

### Payment Flow (Cashfree Integration)
1. Cashfree Web SDK opens the payment modal on `/dashboard` or `/payment`.
2. Customer selects UPI, Card, Netbanking, or Wallet.
3. On completion, Cashfree redirects client to `/payment?order_id=...` or triggers client callback.
4. Client sends verification request to `POST /api/payments/verify-payment`.
5. Server queries Cashfree API `GET /orders/{order_id}` to confirm payment status is `'PAID'`.
6. On verified payment:
   * Booking `status` transitions to `'confirmed'`.
   * Booking `booking_status` is set to `'Confirmed'`.
   * Booking `contact_status` is set to `'Pending'`.
   * Asynchronous `sendAdminNotifications()` dispatches Telegram alerts and Admin confirmation emails.
   * Client receipt email is triggered.

### Payment Webhook Flow
1. Cashfree sends asynchronous server-to-server webhook `POST /api/payments/webhook`.
2. Server validates Cashfree signature / order payload.
3. If order is `'PAID'`, updates `bookings` table idempotently (`status = 'confirmed'`).
4. Dispatches audit trail entry and admin alerts if not already processed.

### Telegram Bot Architecture & Notification Flow
1. `src/lib/notifications.ts` reads `TELEGRAM_BOT_TOKEN` and comma-separated `TELEGRAM_CHAT_ID`.
2. Generates current timestamp in Indian Standard Time (`Asia/Kolkata`).
3. Constructs MarkdownV2 formatted message with Client name, email, phone, service, amount, booking ID, and order ref.
4. Loops over all configured Chat IDs and dispatches requests with 8-second timeout abort controllers.
5. In addition, Supabase Edge Function `supabase/functions/telegram-bot/index.ts` provides webhook command handling (`/start`, `/status`).

### Admin Dashboard & Booking Management
1. Route `/admin` is guarded by Server Component layout checking `profiles.role === 'admin'`.
2. Dashboard displays executive KPIs (Total Revenue, Active Bookings, Unread Inquiries, Blocked Accounts).
3. Overview table features real-time inline status dropdown (`InlineManageDropdown.tsx`) allowing admins to change Contact and Booking statuses with instant `router.refresh()`.
4. Detailed CRM page `/admin/bookings/[id]` includes `BookingActionPanel.tsx` for managing contact statuses (`Pending`, `Contacted`, `Callback Required`, `No Response`), booking operational statuses (`Confirmed`, `Completed`, `Cancelled`), admin notes, and follow-up datetime reminders.
5. Every status modification logs an entry in `booking_history`.

### Contact / Inquiry System
1. Public visitors submit message on landing page via `POST /api/contact`.
2. Record is stored in `contact_messages` with status `'new'`.
3. Admin layout displays a live red unread counter badge next to the "Messages" link.
4. `/admin/messages` renders interactive `MessageInboxTable.tsx` allowing admins to view full inquiries in a modal, update lifecycle status (`New`, `Read`, `Replied`, `Resolved`, `Archived`), and save internal admin notes via `POST /api/admin/update-message`.

### Customer Blocking / Blacklist System
1. Admins can block problematic customers directly from `/admin/bookings/[id]` or `/admin/blocked-customers`.
2. Stores user ID, email, phone, IP address, and User-Agent in `customer_blocks` with a reason.
3. Unblocking is handled via `POST /api/admin/unblock-customer`.
4. Blocked entities are strictly rejected at order initialization (`/api/payments/create-order`).

---

## 5. CRITICAL BUSINESS RULES (MUST NOT BE BROKEN)

### Booking Rules
* A user with an active confirmed booking cannot create a duplicate active booking.
* **COMPLETED** booking does not prevent future booking.
* **CANCELLED** booking does not prevent future booking.
* **FAILED** payment does not permanently block future booking.
* **EXPIRED/ABANDONED** payment can be retried.
* Historical bookings must remain in history.

### Status Separation
Keep these separate (changing one must not accidentally overwrite another):
* **Payment Status (`bookings.status`):** `draft`, `pending_payment`, `confirmed`, `failed`, `cancelled`, `refunded`
* **Contact Status (`bookings.contact_status`):** `Pending`, `Not Contacted`, `Contacted`, `Callback Required`, `No Response`
* **Booking Status (`bookings.booking_status`):** `Confirmed`, `Completed`, `Cancelled`

### Admin & Telegram Rules
* Only authorized admins can change booking status or block/unblock customers.
* Blocked customers cannot create new bookings.
* Every important admin action must be auditable (`booking_history`).
* Telegram bot token stays in environment secrets / Supabase secrets.
* Unauthorized Telegram users must never receive private booking/customer information.
* Telegram failure must not destroy or roll back a successful booking.

---

## 6. ARCHITECTURE MAP

```text
Customer → Frontend (Next.js 14) → Supabase Auth → Booking (Draft/Pending) → Cashfree PG SDK
                                                                                    ↓
Admin Dashboard ← Telegram Push Alerts ← Supabase DB (Confirmed) ← Payment Webhook / Verify
```

### Relationship Map
* **Frontend ↔ Supabase:** Next.js Client & Server Components query Supabase DB & Auth via `@supabase/ssr`.
* **Frontend ↔ Cashfree:** Next.js server creates order sessions; frontend SDK mounts checkout modal.
* **Cashfree ↔ Supabase:** Cashfree Webhook / Verify API transitions payment state to `confirmed`.
* **Supabase ↔ Telegram:** Post-confirmation notification trigger dispatches multi-chat Telegram messages.
* **Edge Functions ↔ Supabase:** Deno Edge functions handle interactive Telegram commands and automated webhooks.

---

## 7. API ENDPOINTS & ROUTES

### Pages & Routes
* `/`: Main 3D landing page, interactive showcase, portfolio, and contact form.
* `/login`: Unified authentication page (Login & Signup mode switch, interactive Cat stage, email verification handling).
* `/dashboard`: Client portal, booking management, and "Book Consultation" Cashfree checkout.
* `/payment`: Dedicated Cashfree PG checkout redirect and verification view.
* `/admin`: Admin Console overview, executive KPIs, and inline booking management.
* `/admin/bookings`: Full CRM bookings table with filtering and links to detail pages.
* `/admin/bookings/[id]`: Booking details view with `BookingActionPanel`, audit log history, and customer blocker.
* `/admin/messages`: Inquiries inbox with status filters and interactive modal inspector.
* `/admin/blocked-customers`: Blacklist management panel with block/unblock controls.

### API Endpoints
* `POST /api/contact`: Public endpoint for contact form submissions.
* `POST /api/payments/create-order`: Generates Cashfree order session and creates draft/pending booking.
* `POST /api/payments/verify-payment`: Verifies Cashfree payment status and confirms booking.
* `POST /api/payments/webhook`: Asynchronous Cashfree webhook handler.
* `POST /api/admin/update-booking`: Updates CRM `contact_status`, `booking_status`, notes, and reminders.
* `POST /api/admin/update-message`: Updates inquiry status (`read`, `replied`, `resolved`) and admin notes.
* `POST /api/admin/block-customer`: Adds user/email/phone to blacklist.
* `POST /api/admin/unblock-customer`: Removes customer from blacklist.
* `GET /api/projects`: Fetches published portfolio items.

### Important Edge Functions
* `supabase/functions/telegram-bot/index.ts`: Supabase Deno Edge Function for Telegram bot interactions.

### Key Components & Utilities
* `src/lib/supabase/client.ts`: Browser Supabase client.
* `src/lib/supabase/server.ts`: Server Component and Server Admin Supabase clients.
* `src/lib/notifications.ts`: Telegram push notifications (multi-chat + IST) and Nodemailer transactional mailer.
* `src/components/admin/BookingActionPanel.tsx`: Interactive status selector, notes, and reminders.
* `src/components/admin/InlineManageDropdown.tsx`: Inline status management for dashboard tables.
* `src/components/admin/MessageInboxTable.tsx`: Interactive messages viewer modal and status manager.
* `src/components/admin/BlockCustomerButton.tsx`: One-click client blacklist action button.
* `src/components/dom/LoginCatStage.tsx`: Interactive animated cat login mascot.

---

## 8. CURRENT PROJECT SNAPSHOT
* ✅ **Landing Page & 3D Visual Experience:** Implemented with Three.js & R3F.
* ✅ **Supabase Auth (Login / Signup / Password Reset):** Implemented with profile sync trigger.
* ✅ **Cashfree Payment Gateway Integration:** Implemented (Order creation, modal SDK, verification).
* ✅ **Booking State Machine & Idempotency:** Implemented with server-side UUIDs.
* ✅ **Stale Payment Auto-Retirement:** Implemented (30-minute pending session timeout).
* ✅ **Rebooking Eligibility:** Implemented (Completed and Cancelled bookings allow immediate rebooking).
* ✅ **Multi-Chat Telegram Push Alerts:** Implemented with IST timestamps and timeout guards.
* ✅ **Admin Layout & Zero-Trust Access Gate:** Implemented (`profiles.role === 'admin'`).
* ✅ **Admin CRM & Booking Action Panel:** Implemented with audit logging.
* ✅ **Contact Inquiries Inbox, Modal & Message Deletion:** Implemented with live unread badge count, permanent delete with confirmation step, and zero-trust admin verification.
* ✅ **Customer Blacklist / Abuse Protection:** Implemented with multi-identifier check.
* 🔧 **Live Database Index (`idx_one_active_booking`):** Needs execution of updated SQL in Supabase SQL editor to align with rebooking rules.

---

## 9. CHANGE SAFETY / DO NOT BREAK
**Adding a new feature must not break an existing working feature.**
Before any change:
1. Read `BRAIN.md`.
2. Identify affected systems.
3. Inspect existing implementation.
4. Identify dependencies and side effects.
5. Make the smallest safe change.
6. Test the affected feature.
7. Test critical related flows.
8. Verify existing features still work.
9. Only then consider the change complete.
Do not rewrite working systems unnecessarily. Do not create duplicate tables, APIs, auth flows, status fields, or business logic.

---

## 10. REGRESSION CHECKLIST
After major changes, test the following:
* [ ] Signup & Profile Creation
* [ ] Login & Logout
* [ ] Booking Creation (Draft & Pending)
* [ ] Rebooking after Completed booking
* [ ] Rebooking after Cancelled booking
* [ ] Payment Success & State Transition to `confirmed`
* [ ] Payment Failure handling
* [ ] Payment Retry after timeout
* [ ] Cashfree Webhook receipt
* [ ] Telegram Notification delivery (Multi-chat + IST)
* [ ] Admin Login & Zero-Trust Redirects
* [ ] Admin Dashboard KPI rendering
* [ ] Booking Management (Contact & Booking status updates)
* [ ] Status Synchronization across pages
* [ ] Messages Inbox (Viewing modal, updating status, saving notes)
* [ ] Customer Blocking & Block enforcement during checkout
* [ ] Follow-up / Reminder setting
* [ ] RLS & Security enforcement

---

## 11. LESSONS LEARNED (PREVENT PREVIOUS MISTAKES)
* **Do not use "any previous booking exists" as the booking eligibility rule.** Only active, confirmed consultations block new bookings.
* **Do not mix payment status, booking status, and contact status.** They represent three independent lifecycles.
* **Do not let Dashboard and Booking Details use conflicting status sources.** Both must read directly from the database and trigger `router.refresh()`.
* **Do not fix only the frontend when the real problem is in Supabase/RLS/database logic.**
* **Do not break working Telegram notifications while changing booking logic.**
* **Do not introduce a new implementation when an existing working system can be extended.**
* **After changing database logic, test both the frontend and the backend.**

---

## 12. CHANGE LOG
* **2026-08-19** — Initialized `BRAIN.md` Master Context document covering Next.js 14 App Router architecture, Supabase schema, Cashfree PG integration, Telegram multi-chat notification dispatch, CRM audit trail, and customer blacklist system.

---

## 13. DEPLOYMENT & LOCAL DEVELOPMENT

### Local Development Commands
* Install dependencies: `npm install`
* Run development server: `npm run dev` (Starts at `http://localhost:3000`)
* Type check: `npx tsc --noEmit`
* Test Telegram bot: `node scripts/test-telegram.js`

### Production Requirements
* Build command: `npm run build`
* Production start: `npm run start`
* Ensure all environment variables from `.env.example` are configured in Vercel / hosting platform.
* Ensure SQL migration in `supabase/schema.sql` is fully executed in the Supabase PostgreSQL database.
