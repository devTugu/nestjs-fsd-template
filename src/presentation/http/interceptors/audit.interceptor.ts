import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Request } from 'express';
import { RecordAuditLogUseCase } from '@application/audit/use-cases/record-audit-log.use-case';

const AUDITED_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly recordAudit: RecordAuditLogUseCase) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const method = request.method.toUpperCase();

    if (!AUDITED_METHODS.has(method) && !this.isAuthAuditRoute(request)) {
      return next.handle();
    }

    const auditMeta = this.resolveAuditMeta(request, method);

    return next.handle().pipe(
      tap(() => {
        void this.recordAudit.execute({
          userId: auditMeta.userId,
          action: auditMeta.action,
          resource: auditMeta.resource,
          resourceId: auditMeta.resourceId,
          ipAddress: this.resolveIp(request),
          metadata: auditMeta.metadata,
        });
      }),
    );
  }

  private isAuthAuditRoute(request: Request): boolean {
    const path = request.path.toLowerCase();
    return path.includes('/auth/login') || path.includes('/auth/logout');
  }

  private resolveAuditMeta(
    request: Request,
    method: string,
  ): {
    userId: number | null;
    action: string;
    resource: string;
    resourceId: string | null;
    metadata: Record<string, unknown> | null;
  } {
    const path = request.path;
    const segments = path.split('/').filter(Boolean);
    const resource =
      segments.find((s) =>
        ['users', 'roles', 'permissions', 'auth'].includes(s),
      ) ?? 'unknown';
    const user = request.user;
    const userId = user?.sub ?? null;

    let action = method;
    if (path.includes('/auth/login')) action = 'LOGIN';
    if (path.includes('/auth/logout')) action = 'LOGOUT';

    const idSegment = segments[segments.length - 1];
    const resourceId = idSegment && /^\d+$/.test(idSegment) ? idSegment : null;

    return {
      userId,
      action,
      resource,
      resourceId,
      metadata: { path, method },
    };
  }

  private resolveIp(request: Request): string | null {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0]?.trim() ?? null;
    }
    return request.ip ?? null;
  }
}
