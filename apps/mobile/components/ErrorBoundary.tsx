// Re-export the rider implementation as the canonical mobile ErrorBoundary.
// (rider and driver both ship near-identical class-based boundaries; this
// avoids divergence and keeps the role layouts importing a single source.)
export { ErrorBoundary } from '@rider/components/ErrorBoundary';
