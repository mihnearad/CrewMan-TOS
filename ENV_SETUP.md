# Environment Setup

Please create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_postgres_connection_string
```

**Note:** `DATABASE_URL` should be the direct connection string (Transaction Pooler or Session Pooler) to your Supabase Postgres database. It usually looks like:
`postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

# AI Agent Database Access

To allow the AI Agent (or yourself) to run raw SQL migrations or modifications, a script has been created at `scripts/db-manager.js`.

**Usage:**

```bash
node scripts/db-manager.js "CREATE TABLE test (id SERIAL PRIMARY KEY);"
```

The AI agent can use this via `run_shell_command` to apply schema changes.
