# Contributing to OpenSchool

Thanks for contributing. Keep changes focused, simple, and aligned with the existing Next.js application.

## Local setup

1. Fork the repository and create a branch from `main`.
2. Clone your fork and enter the frontend folder:

   ```bash
   git clone https://github.com/<your-username>/OPENSCHOOL.git
   cd OPENSCHOOL/web
   ```

3. Copy `.env.example` to `.env.local`, then add your own development credentials.
4. Install and run the app:

   ```bash
   npm install
   npm run dev
   ```

## Before opening a pull request

- Keep the change small and describe its purpose clearly.
- Do not commit `.env` files, credentials, or generated build files.
- Run the relevant checks when your change allows it:

  ```bash
  npm run lint
  npm run build
  ```

- Update the README when the setup, features, or developer workflow changes.
- Use a descriptive pull-request title and explain what you changed and how you tested it.

## Code style

Use TypeScript, follow the surrounding component patterns, and prefer reusable components over duplicated UI. Avoid unrelated formatting or refactoring in the same pull request.
