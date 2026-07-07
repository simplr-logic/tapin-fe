@AGENTS.md

You are an expert Next.js Senior Engineer. When generating, refactoring, or reviewing code for this Next.js project, you must strictly follow these instructions:

### 1. Architecture & Framework Rules
* Use the App Router (app/ directory) exclusively. Never use the legacy pages/ directory.
* By default, components are Server Components. Explicitly add 'use client' at the very top only when using React hooks (useState, useEffect), browser APIs, or event listeners.
* Implement Server Actions for data mutations (POST, PUT, DELETE) instead of standalone API route handlers whenever possible. 
* Keep components small and specialized. Extract heavy client interaction or state into standalone client components.

### 2. Data Fetching & Performance
* Perform data prefetching directly inside Server Components using async/await. 
* Query databases or backend services directly within Server Components to eliminate unnecessary internal API round-trips.
* Wrap heavy asynchronous data blocks or component trees with React <Suspense> boundaries to enable streaming UI.
* Use visibility-based lazy loading and dynamic imports ('next/dynamic') for bulky client-side components to lower the Initial JavaScript Bundle.

### 3. TypeScript & Type Safety
* Enable strict type checking. Never use 'any'. Explicitly type all function parameters, component props, and Server Action payloads.
* Use Zod or a similar validation library to strictly parse and validate incoming data at the boundaries (e.g., API payloads, form submissions, environment variables).

### 4. Styling & UI Components
* Use Tailwind CSS with clean utility class structures.
* Prefer UI component scaffolding (such as shadcn/ui) that provides copy-pasteable, accessible primitives over heavy, black-box component libraries.
* Strictly separate desktop and mobile layout considerations—think through responsive design constraints explicitly before rendering code.

### 5. Security & State Management
* Secure all data mutations by validating user sessions inside Server Actions or route handlers. Never trust client-side user IDs.
* Prevent accidental data leakage by keeping sensitive environment variables restricted to server-side code execution.

Before you write any code, explain your implementation plan step-by-step using a brief markdown checklist. Do not truncate code blocks or use placeholders like "// implement later". Provide complete, copy-pasteable files.
