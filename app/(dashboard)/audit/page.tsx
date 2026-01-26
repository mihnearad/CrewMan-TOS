import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth-helpers'
import { getAuditLogs } from '@/lib/audit'
import AuditLogTable from '@/components/audit/AuditLogTable'
import AuditLogFilters from '@/components/audit/AuditLogFilters'

export const dynamic = 'force-dynamic'

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Check if user is admin
  const userIsAdmin = await isAdmin()
  
  if (!userIsAdmin) {
    redirect('/?error=You do not have permission to access the audit log')
  }

  // Parse search params
  const tableName = typeof searchParams.table === 'string' ? searchParams.table : undefined
  const action = typeof searchParams.action === 'string' ? searchParams.action as 'CREATE' | 'UPDATE' | 'DELETE' | undefined : undefined
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1
  const limit = 50
  const offset = (page - 1) * limit

  // Fetch audit logs
  const { data: logs, count } = await getAuditLogs({
    tableName,
    action,
    limit,
    offset,
  })

  const totalPages = Math.ceil(count / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Audit Log
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View all changes made across the application
          </p>
        </div>
      </div>

      <AuditLogFilters 
        currentTable={tableName}
        currentAction={action}
      />

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
        <AuditLogTable
          logs={logs}
          currentPage={page}
          totalPages={totalPages}
          totalCount={count}
        />
      </div>
    </div>
  )
}
