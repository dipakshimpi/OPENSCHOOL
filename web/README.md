# OpenSchool Frontend Polish

This project has been transformed from a basic administrative interface into a **rich, modern Learning Management System (LMS)** frontend.

## 🎨 UI/UX Transformation
The design now follows a "premium SaaS" aesthetic, inspired by platforms like Coursera and Udemy.
- **Rich Color Palette**: Replaced flat whites with layered backgrounds (Slate/Indigo), glassmorphism effects, and semantic colors.
- **Visual Hierarchy**: Content is organized into cards with distinct shadows and rounded corners.
- **Interactive Elements**: Hover states, smooth transitions, and dynamic tab/form components.

## 🛠 Tech Stack Enhancements
- **Tailwind CSS**: Upgraded configuration to use HSL variables for dynamic theming (Dark Mode ready).
- **shadcn/ui**: Integrated key components (`Card`, `Tabs`, `Button`, `Input`, `Badge`, `Progress`) with custom styling.
- **Heroicons**: Replaced generic text/scaffolding with consistent, high-quality SVG icons.
- **Layouts**: Created a robust `DashboardLayout` with a responsive sidebar and glassmorphic header.

## 🚀 Key Features Implemented (Frontend Only)

### 1. Authentication
- **Login & Register**: Rich split-screen layouts with animated backgrounds and role selection (Admin/Teacher/Student).
- **Mock Auth**: Simulates login delays and redirects to appropriate dashboards.

### 2. Role-Based Dashboards
- **Admin**: Revenue charts (visual), user activity feeds, and KPI cards.
- **Teacher**: Class schedules with status indicators, quick action buttons, and attendance metrics.
- **Student**: Course progress tracking, "Next Lesson" prompts, and visual course grids.

### 3. Polish & Details
- **Profile Pages**: Rich header with avatars and editable form sections.
- **Attendance**: clean, badge-based status indicators instead of raw tables.
- **Navigation**: Persistent, collapsible sidebar with active state highlighting.

## 📦 How to Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000)

## ⚠️ Notes
- This is a **pure frontend implementation**. No real backend logic or database is connected.
- Data is mocked/static for demonstration purposes.
