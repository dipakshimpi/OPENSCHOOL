# 🏫 OPENSCHOOL: Next-Generation LMS
OPENSCHOOL is a high-performance Learning Management System (LMS) built for the modern educational ecosystem. It features a sophisticated "Identity Bridge" between Keycloak and Supabase to provide enterprise-grade security with developer-friendly data management.

## 📖 Essential Documentation
For deep technical details, setup guides, and architectural decisions, please refer to:
👉 **[PROJECT_ARCH_DOC.md](./PROJECT_ARCH_DOC.md)** (Read this first!)

## 🎨 Design Philosophy
The design follows a "premium SaaS" aesthetic:
- **Rich Visuals**: Layered backgrounds (Slate/Indigo), glassmorphism, and semantic color systems.
- **Responsive Layouts**: Seamless transitions between desktop and mobile via a robust `DashboardLayout`.
- **Micro-Animations**: Subtle feedback transitions using Framer Motion (where applicable) and Tailwind.

## 🛠 Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Identity**: Keycloak (OIDC, Credentials, Google OAuth)
- **Database**: Supabase (Postgres + Row Level Security)
- **Server**: PostgREST + Custom Next.js API Routes
- **Styling**: Tailwind CSS + shadcn/ui

## 🚀 Key Modules
1.  **Authentication Bridge**: Proxies Keycloak users into Supabase profiles automatically.
2.  **Timetable Engine**: Indian School Style (Day/Period/Subject) with collision detection.
3.  **Geo-Attendance**: Satellite-verified attendance capture using circular geo-fences.
4.  **Admin Control**: Approval-based registration system and institutional anchoring.
5.  **Video LMS**: Secure video playback and course content delivery.

## 📦 Getting Started
1. **Environment Config**:
   Copy `.env.local` and configure your Supabase and Keycloak keys.
2. **Install**:
   ```bash
   npm install
   ```
3. **Run**:
   ```bash
   npm run dev
   ```

## ⚠️ Internal Security Note
- Row Level Security (RLS) is enabled on critical tables (using broad anon or app-level filtering).
- **NEVER** expose the `SERVICE_SUPABASESERVICE_KEY` to the client.

