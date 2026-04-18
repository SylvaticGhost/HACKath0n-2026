# GitHub Copilot Instructions

## 🏗️ Project Architecture Overview

This is a TypeScript-based monorepo consisting of three main parts:

1. **`api/`**: Backend application built with NestJS.
2. **`web/`**: Frontend application built with React, Vite, and TanStack Router.
3. **`shared/`**: Shared library containing DTOs, types, constants, and utility functions used by both `api` and `web`.

---

## 🌍 General TypeScript Rules

- **Strict Typing**: Always write strict TypeScript. Avoid `any`; use `unknown` if the type is truly dynamic.
- **Interfaces over Types**: Prefer `interface` for object shapes and `type` for unions/intersections.
- **Shared Code**: Never duplicate DTOs, constants, or shared utilities between `web` and `api`. Always import them from the `shared/` package.
- **Result Pattern**: Use the `Result` monad (`shared/utils/result.ts`) for handling success and failure states gracefully instead of overusing `try/catch` and throwing raw exceptions.

---

## 🔙 API (NestJS) Guidelines

- **Framework**: Use NestJS decorators and dependency injection strictly. Follow the modular architecture (e.g., `src/modules/user/`).
- **Validation (Zod)**:
  - Do NOT use `class-validator` or `class-transformer`.
  - Use **Zod** for schema validation.
  - Apply the custom `@ApiZodBody()` decorator or `ZodValidationPipe` (`src/middleware/zod-validation.pipe.ts`) for validating incoming request payloads.
- **Database (TypeORM)**: Use TypeORM for database interactions. Define entities (e.g., `*.entity.ts`) and use the Repository pattern.
- **Authentication**: Use the implemented JWT strategies (`src/modules/user/auth-strategies/jwt.strategy.ts`). Apply `@UseGuards(AuthGuard)` or custom user guards for protected endpoints.
- **Passwords**: Never store plain-text passwords. Use the `password.helper.ts` utilities for hashing and comparing passwords.

---

## 🎨 Web (React / Vite) Guidelines

- **Framework**: Use React functional components and standard hooks.
- **Routing (TanStack Router)**:
  - Do NOT use `react-router-dom`.
  - Use `@tanstack/react-router` for file-based routing.
  - Place new routes inside `src/routes/` following the framework's file naming conventions (e.g., `_root.tsx`, `_app/`, `_auth/`).
- **Styling (Tailwind & shadcn/ui)**:
  - Use standard Tailwind CSS utility classes for styling.
  - Utilize pre-built `shadcn/ui` components from `src/components/ui/` (e.g., `Button`, `Input`, `Card`, `Dialog`) instead of building standard UI elements from scratch.
- **API Communication**: Use the shared API client (`src/shared/api/client.ts`) for network requests instead of raw `fetch` or `axios` instances.
- **State Management**: Use the existing store conventions (e.g., `src/shared/auth/auth.store.ts`) for global state.

---

## 📦 Shared Package Guidelines

- Place all shared HTTP contracts, DTOs, and request/response schemas in `shared/contracts/`.
- Maintain pagination utilities (`paginated-list.ts`) and standard types in `shared/types/`.
- Ensure changes here do not use strictly Node.js or DOM-specific APIs, as this code is consumed by both environments.

---

## 🧹 Code Formatting & Linting

- **Prettier**: Ensure generated code respects standard Prettier formatting (derived from `.prettierrc.json`).
- **Naming Conventions**:
  - `camelCase` for variables and functions.
  - `PascalCase` for Classes, Components, Interfaces, and Zod Schemas.
  - `kebab-case` for file names (except React components, which use `PascalCase.tsx`).
