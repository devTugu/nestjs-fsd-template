/**
 * OpenTelemetry bootstrap placeholder.
 * Wire @opentelemetry/sdk-node here when exporting traces to your collector.
 */
export function initTracing(): void {
  if (process.env.OTEL_ENABLED !== 'true') {
    return;
  }
  // Example: NodeSDK + HTTP exporter — add dependencies and enable in production.
}
