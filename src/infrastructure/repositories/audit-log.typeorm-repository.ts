import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AuditLogRecord,
  IAuditLogRepository,
} from '@application/ports/audit-log.port';
import { AuditLog } from '../database/typeorm/entities/audit-log.entity';

@Injectable()
export class AuditLogTypeOrmRepository implements IAuditLogRepository {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repository: Repository<AuditLog>,
  ) {}

  async save(record: AuditLogRecord): Promise<void> {
    await this.repository.save(
      this.repository.create({
        userId: record.userId,
        action: record.action,
        resource: record.resource,
        resourceId: record.resourceId,
        ipAddress: record.ipAddress,
        metadata: record.metadata,
      }),
    );
  }
}
