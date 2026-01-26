import { getAuditLogsForRecord } from '@/lib/audit'
import RecordHistoryClient from './RecordHistoryClient'

type RecordHistoryProps = {
  tableName: string
  recordId: string
}

export default async function RecordHistory({ tableName, recordId }: RecordHistoryProps) {
  const logs = await getAuditLogsForRecord(tableName, recordId)
  return <RecordHistoryClient logs={logs} />
}
