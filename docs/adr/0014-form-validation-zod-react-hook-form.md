# ADR 0014: Form Validation with Zod and React Hook Form

## Status
Aceito

## Contexto
The app has several user-driven flows with validation needs: login, register, OTP, cargo creation, filters, and profile edits. Manual state handling alone increases the chance of inconsistent errors and duplicated rules.

## Decision
Use Zod as the source of truth for validation and React Hook Form for forms with multiple inputs, submission state, and error rendering.

## Consequences
- validation becomes centralized and testable;
- form errors stay human-readable and accessible;
- form types can be inferred from schemas;
- some forms may need a small refactor to adopt the shared pattern.

## Alternatives considered
- keep manual validation in component state;
- use a different schema library;
- validate only on the backend.
