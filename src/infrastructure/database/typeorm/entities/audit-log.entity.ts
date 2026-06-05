import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('IDX_audit_user_id')
  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @Column({ length: 100 })
  action: string;

  @Column({ length: 100 })
  resource: string;

  @Column({ name: 'resource_id', type: 'varchar', length: 64, nullable: true })
  resourceId: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
