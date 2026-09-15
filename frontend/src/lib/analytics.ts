/**
 * Analytics.
 *
 * Spec 9 names four things worth measuring: booking funnel drop-off step by
 * step, pincode check results including the failures, lead source attribution,
 * and call-button taps. The pincode failures matter most - they are the map of
 * where demand exists that operations cannot yet serve.
 *
 * Two rules this module enforces rather than documents:
 *
 * 1. No third-party script. Events go to our own endpoint or nowhere. A
 *    marketing tag on a page where someone types a patient's condition is a
 *    DPDP problem, not a growth tool.
 *
 * 2. No PII, ever. Names, phone numbers, addresses and condition notes are
 *    stripped before an event leaves the page, and the allowlist below is the
 *    only thing that can be sent.
 */

type EventName =
  | 'pincode_check'
  | 'waitlist_join'
  | 'booking_step_view'
  | 'booking_step_complete'
  | 'booking_submitted'
  | 'booking_abandoned'
  | 'application_step_complete'
  | 'application_submitted'
  | 'lead_submitted'
  | 'call_tap'
  | 'whatsapp_tap';

/**
 * The only properties that may be sent. Anything not on this list is dropped,
 * so adding a surface to a call site cannot quietly start leaking PII.
 */
const ALLOWED_PROPS = new Set([
  'pincode',
  'covered',
  'city',
  'source',
  'step',
  'stepName',
  'serviceSlug',
  'urgency',
  'durationPattern',
  'applicantType',
  'reference',
  'reason',
  'surfaceCount',
  'errorCode',
]);

type Props = Record<string, string | number | boolean | null>;

const ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT ?? '';

function scrub(props: Props): Props {
  const out: Props = {};
  for (const [key, value] of Object.entries(props)) {
    if (!ALLOWED_PROPS.has(key)) continue;
    // A reference number is fine; anything longer is probably free text.
    if (typeof value === 'string' && value.length > 64) continue;
    out[key] = value;
  }
  return out;
}

export function track(name: EventName, props: Props = {}): void {
  const payload = {
    name,
    props: scrub(props),
    path: typeof location === 'undefined' ? '' : location.pathname,
    ts: Date.now(),
  };

  if (!ENDPOINT) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('[analytics]', payload.name, payload.props);
    }
    return;
  }

  // sendBeacon survives the page being closed, which is exactly the case for
  // an abandonment event.
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
    } else {
      void fetch(ENDPOINT, { method: 'POST', body, keepalive: true });
    }
  } catch {
    // Analytics must never break the page it is measuring.
  }
}

/**
 * Wires the tap-to-call and WhatsApp links site-wide.
 *
 * Delegated from the document so every phone link is covered without each one
 * remembering to carry a handler. Links opt in with data-analytics.
 */
export function installLinkTracking(): () => void {
  const onClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement | null)?.closest('[data-analytics]');
    if (!target) return;
    const source = target.getAttribute('data-analytics') ?? 'unknown';
    const href = target.getAttribute('href') ?? '';
    if (href.startsWith('tel:')) track('call_tap', { source });
    else if (href.includes('wa.me')) track('whatsapp_tap', { source });
  };

  document.addEventListener('click', onClick);
  return () => document.removeEventListener('click', onClick);
}
