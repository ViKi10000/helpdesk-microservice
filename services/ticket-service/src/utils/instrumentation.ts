import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const sdk = new NodeSDK({
  serviceName: "ticket-service",

  traceExporter: new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces",
  }),

  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

console.log("OpenTelemetry tracing initialized: Ticket Service");

export default sdk;
