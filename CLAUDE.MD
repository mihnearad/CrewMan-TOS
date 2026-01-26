# CrewMan-TOS

Crew Management and Planning System - A Next.js 16 application for managing maritime crew assignments, projects, clients, and consultants.

This project will be used by the company called TOS People. They will use this to manage crew assignments and projects. It will be used only by them. Each employee will have its own account. 


## Tech Stack

- **Framework**: Next.js 16.1.3 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL with RLS)
- **Styling**: Tailwind CSS 4 with dark mode support
- **State**: React 19, Server Components, Server Actions
- **Icons**: lucide-react
- **Utilities**: date-fns, clsx, tailwind-merge

## Project Structure

```
app/
├── (dashboard)/         # Protected routes with sidebar layout
│   ├── crew/            # Crew member management
│   ├── projects/        # Project management
│   ├── clients/         # Client management
│   ├── consultants/     # Consultant management
│   ├── planning/        # Gantt-style planning board
│   └── settings/        # App settings
├── login/               # Authentication
└── api/                 # API routes

components/
├── ui/                  # Reusable UI components (Toast, StatCard, etc.)
├── planning/            # Gantt chart components
├── assignments/         # Assignment-related components
└── layout/              # Layout components (Header, Sidebar)

lib/
├── supabase/            # Supabase client (server.ts, client.ts, middleware.ts)
├── gantt/               # Gantt chart utilities and types
├── hooks/               # Custom React hooks
└── utils.ts             # Utility functions (cn, date helpers)

supabase/
├── schema.sql           # Base database schema
└── migrations/          # Incremental migrations (numbered 001-012+)
```

## Key Commands

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

## Critical Rules

### 1. Infrastructure Lock
You are forbidden from modifying the environment, Docker, or database schema without user permission.

### 2. Immutable Stack
You are forbidden from adding new dependencies unless the user gives permission.

### 3. Never Downgrade
Never fix a bug by deleting a feature or downgrading requirements. Do not simplify complex logic just because it's easier.

### 4. Never Change Ports
The frontend runs on port 3000. Do not change this.

### 5. Database Safety
- Never delete existing database entries without user permission
- Never modify RLS policies without explicit approval
- Migrations must be numbered sequentially (check existing: 001-012)

### 6. Plan Before Acting
For any task involving more than one file or cross-stack logic (Frontend <-> Backend <-> Database), outline your plan in bullet points and wait for confirmation.

### 7. Git Protocol
- Always pull and read before writing
- Use Edit instead of full file rewrites
- Run `git diff` as a safety net after changes

### 8. UI Consistency
All UI changes must conform to the existing design system:
- Use `cn()` utility for class merging (from `lib/utils.ts`)
- Follow dark mode patterns: `dark:bg-gray-950`, `dark:text-gray-200`
- Use existing color palette (gray, blue, green, yellow, red, purple, orange)
- Icons from lucide-react only

### 9. End-to-End Testing Required
You MUST NOT declare any task complete without thorough end-to-end testing. "It should work" is NOT acceptable.

## Code Conventions

### File Naming
- Components: PascalCase (`GanttView.tsx`, `CrewDetailModal.tsx`)
- Utilities/hooks: camelCase (`useSearchFilters.ts`, `exportPdf.ts`)
- Server Actions: `actions.ts` in the relevant `app/` directory

### Server Actions Pattern
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function actionName(formData: FormData) {
  const supabase = await createClient()
  // ... implementation
  revalidatePath('/path')
  redirect('/path')
}
```

### Component Pattern
```typescript
'use client'  // Only when needed for interactivity

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ComponentProps {
  // Props with TypeScript types
}

export default function Component({ prop }: ComponentProps) {
  // Implementation
}
```

### Supabase Usage
- Server Components: `import { createClient } from '@/lib/supabase/server'`
- Client Components: `import { createClient } from '@/lib/supabase/client'`
- Always handle errors with `console.error` and user feedback

### Path Aliases
Use `@/` for all imports:
```typescript
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
```

## Database Tables

- `profiles` - User profiles (extends auth.users)
- `projects` - Projects with status, dates, color
- `crew_members` - Crew with role, status, contact info
- `assignments` - Links crew to projects with date ranges
- `clients` - Client companies
- `consultants` - External consultants

## Common Patterns

### Status Colors
```typescript
// Crew status: available, on_project, on_leave, planned, training
// Use getCrewStatusDisplay() from lib/utils.ts

// Assignment status: ending-critical, ending-soon, active, past
// Use getAssignmentStatus() and getStatusColorClasses()
```

### Dark Mode
All components must support dark mode using Tailwind's `dark:` prefix:
```typescript
className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
```

### Toast Notifications
```typescript
import { useToast } from '@/components/ui/ToastProvider'

const { showToast } = useToast()
showToast('Success message', 'success')  // success | error | info
```


