import { PiniaPluginContext } from 'pinia';
import * as Sentry from '@sentry/vue';

// Define keys that should be masked before sending data to Sentry
const SENSITIVE_KEYS = [/password/i, /token/i, /secret/i, /email/i, /phone/i, /card/i];

/**
 * Recursively sanitizes an object by masking values for sensitive keys.
 */
function sanitize(data: any): any {
  if (data === null || data === undefined || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitize);
  }

  if (data instanceof Date || data instanceof RegExp) {
    return data;
  }

  const sanitized: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      if (SENSITIVE_KEYS.some((regex) => regex.test(key))) {
        sanitized[key] = '[MASKED]';
      } else {
        sanitized[key] = sanitize(data[key]);
      }
    }
  }
  return sanitized;
}

/**
 * Pinia plugin to bridge store actions with Sentry breadcrumbs and error capturing.
 */
export function sentryPiniaPlugin({ store }: PiniaPluginContext) {
  store.$onAction(({ name, store, args, after, onError }) => {
    Sentry.addBreadcrumb({
      category: 'pinia.action',
      message: `Action [${store.$id}/${name}]`,
      level: 'info',
      data: { args: sanitize(args) },
    });

    onError((error) => {
      Sentry.captureException(error, {
        extra: {
          storeId: store.$id,
          action: name,
          args: sanitize(args),
          state: sanitize(store.$state), // Capture a sanitized state snapshot
        },
      });
    });
  });

  // Track individual state changes (mutations) as breadcrumbs
  store.$subscribe((mutation) => {
    Sentry.addBreadcrumb({
      category: 'pinia.mutation',
      message: `Mutation [${mutation.storeId}]`,
      level: 'debug',
      data: {
        type: mutation.type,
        payload: sanitize((mutation as any).payload), // Sanitize mutation payload
      },
    });
  });
}