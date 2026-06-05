export interface AuditLogRecord {
  userId: number | null;
  action: string;
  resource: string;
  resourceId: string | null;
  ipAddress: string | null;
  metadata: Record<string, unknown> | null;
}

export interface IAuditLogRepository {
  save(record: AuditLogRecord): Promise<void>;
}
