# 🏫 OPENSCHOOL: Next-Generation LMS
OPENSCHOOL is a high-performance Learning Management System (LMS) built for the modern educational ecosystem. It features a sophisticated "Identity Bridge" between Keycloak and Supabase to provide enterprise-grade security with developer-friendly data management.

## 📖 Getting Started
Follow the instructions below to set up your local development environment. For architectural decisions, refer to the source code and inline comments.

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

1. **Environment Config**:
   Copy `.env.example` to `.env.local` and populate it with your Supabase, Keycloak, and Ant Media Server keys.
2. **Setup Database**:
   Apply the migrations provided in the database layer to your Supabase instance.
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Launch Application**:
   ```bash
   npm run dev
   ```

## ⚠️ Internal Security Note
- Row Level Security (RLS) is enabled on critical tables (using broad anon or app-level filtering).
- **NEVER** expose the `SERVICE_SUPABASESERVICE_KEY` to the client.

