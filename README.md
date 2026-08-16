# OpenSchool

OpenSchool is a role-based learning management system for schools. It gives administrators, teachers, and students one place to manage courses, attendance, timetables, announcements, and learning videos.

The application lives in [`web/`](web) and is built with Next.js.

## Features

- Role-based dashboards for administrators, teachers, and students
- Registration, login, password reset, and account approval flows
- Course creation, enrolment, and class management
- Timetables and attendance tracking, including geo-fence support
- Announcements and profile/settings pages
- Secure video upload, streaming, and playback integration
- Supabase-backed data access and Google OAuth support

## Tech stack

- Next.js (App Router), React, TypeScript
- Tailwind CSS and shadcn/ui
- Supabase (Postgres and authentication-related data)
- NextAuth and Google OAuth
- Ant Media Server integration for video
- Docker and Docker Compose for deployment

## Run locally

### Prerequisites

- Node.js 20 or later
- npm
- A Supabase project
- Optional: Google OAuth and Ant Media Server credentials for those integrations

### Setup

```bash
git clone https://github.com/dipakshimpi/OPENSCHOOL.git
cd OPENSCHOOL/web
copy .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Update `web/.env.local` with your own values before starting the app. Never commit secrets, service-role keys, or local environment files.

### Available commands

```bash
npm run dev    # start the local development server
npm run lint   # run ESLint
npm run build  # create a production build
npm run start  # run the production build
```

## Docker

Create a root `.env` file with the required public environment values, then run:

```bash
docker compose up --build
```

The web app is available on port 3000.

## Project structure

```text
web/
  app/          Next.js pages and API routes
  components/   Reusable UI and feature components
  lib/          Authentication, data, geo, and video utilities
  public/       Static assets
k8s/            Kubernetes manifests
```

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the local workflow and pull-request guidelines.

## Security

Do not expose Supabase service-role keys, OAuth secrets, or Ant Media secrets in client-side code or commits. Report security concerns privately to the repository owner instead of opening a public issue.
