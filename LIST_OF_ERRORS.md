# Project Errors

## TypeScript Errors (npx tsc)
1. **src/routes/_app.dashboard.tsx(201,59)**: Type '{ key: string; cluster: CrisisCluster; onClick: () => void; }' is not assignable to type 'IntrinsicAttributes & { cluster: CrisisCluster; onView: (c: CrisisCluster) => void; }'.
   - **Reason**: Property 'onClick' does not exist on type 'IntrinsicAttributes & { cluster: CrisisCluster; onView: (c: CrisisCluster) => void; }'.
   - **Status**: Fixed.
2. **src/routes/setup.tsx(86,14)**: Property 'catch' does not exist on type 'PostgrestFilterBuilder<any, any, any, null, "alert_preferences", unknown, "POST", false>'.
   - **Reason**: Supabase query builders do not have a .catch method; they return an object with data and error.
   - **Status**: Fixed.

## Linting Errors (npm run lint)
1. **189 problems (182 errors, 7 warnings)**
   - Mostly Prettier formatting issues (indentation, line breaks, etc.).
   - Some ESLint warnings/errors.
   - **Status**: Fixed via formatting and manual fixes. Remaining warnings are mostly Shadcn UI components' structure which is acceptable for Fast Refresh.

## Build Errors (npm run build)
- No build errors found (project built successfully).
