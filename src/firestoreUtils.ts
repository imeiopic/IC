import { 
  onSnapshot, 
  type Query, 
  type DocumentReference, 
  type FirestoreError, 
  type QuerySnapshot, 
  type DocumentSnapshot,
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

  return onSnapshot(ref, { includeMetadataChanges: options.includeMetadataChanges }, onNext, (err) => {
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