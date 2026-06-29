import * as Sentry from '@sentry/vue';
import {
  onSnapshot,
  type DocumentReference,
  type DocumentSnapshot,
  type FirestoreError,
  type Query,
  type QuerySnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { useError } from './useError';

/**
 * Options for the safeOnSnapshot wrapper.
 */
export interface SafeSnapshotOptions {
  /** Callback for local error handling logic (e.g., stopping spinners). */
  onError?: (error: FirestoreError) => void;
  /** Optional condition to determine if the error should be escalated to the global boundary. */
  shouldReport?: (error: FirestoreError) => boolean;
  /** Whether to fire the callback when only metadata (like fromCache) changes. */
  includeMetadataChanges?: boolean;
}

/**
 * monitorFirestore: Measures latency of a Firestore operation and records it as a Sentry breadcrumb.
 */
export async function monitorFirestore<T>(
  opName: string,
  path: string,
  task: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  try {
    const result = await task();
    const duration = performance.now() - startTime;
    Sentry.addBreadcrumb({
      category: 'firestore.latency',
      message: `Operation: ${opName}`,
      level: 'info',
      data: { path, duration: `${duration.toFixed(2)}ms` },
    });
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    Sentry.addBreadcrumb({
      category: 'firestore.latency',
      message: `Operation: ${opName} (Failed)`,
      level: 'warning',
      data: { path, duration: `${duration.toFixed(2)}ms`, error: error instanceof Error ? error.message : String(error) },
    });
    throw error;
  }
}

/**
 * A safe wrapper for Firestore onSnapshot that integrates with the global error boundary.
 * It ensures all listener errors are either handled locally or reported globally.
 */
export function safeOnSnapshot<T>(
  ref: DocumentReference<T>,
  onNext: (snapshot: DocumentSnapshot<T>) => void,
  options?: SafeSnapshotOptions
): Unsubscribe;
export function safeOnSnapshot<T>(
  ref: Query<T>,
  onNext: (snapshot: QuerySnapshot<T>) => void,
  options?: SafeSnapshotOptions
): Unsubscribe;
export function safeOnSnapshot(
  ref: any,
  onNext: any,
  options: SafeSnapshotOptions = {}
): Unsubscribe {
  const { reportError } = useError();
  const startTime = performance.now();
  let hasReceivedFirstSnapshot = false;
  
  // Wrap onNext to capture the latency of the initial data fetch.
  const monitoredNext = (snapshot: any) => {
    if (!hasReceivedFirstSnapshot) {
      const duration = performance.now() - startTime;
      const path = ref.path || (ref.type === 'query' ? 'Query' : 'Unknown Path');
      Sentry.addBreadcrumb({
        category: 'firestore.latency',
        message: `Initial snapshot received: ${path}`,
        level: 'info',
        data: { duration: `${duration.toFixed(2)}ms` },
      });
      hasReceivedFirstSnapshot = true;
    }
    onNext(snapshot);
  };
  
  return onSnapshot(ref, { includeMetadataChanges: options.includeMetadataChanges }, monitoredNext, (err) => {
    // 1. Execute local error handler if provided
    options.onError?.(err);
    // 2. Determine if we should escalate to the global error boundary.
    // By default, we report unless a shouldReport condition returns false.
    const shouldReport = options.shouldReport ? options.shouldReport(err) : true;
    if (shouldReport) {
      reportError(err);
    }
  });
}