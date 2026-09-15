import { useEffect, useState } from 'react';
import { Alert, Button, Input } from '@shared/ui/index.js';
import { apiMode } from '@/lib/api.js';

export interface PhoneVerifyProps {
  phone: string;
  purpose: 'booking' | 'application';
  verified: boolean;
  onVerified: (token: string) => void;
}

/**
 * Phone verification (spec 7.5).
 *
 * Six digits, ten-minute expiry, five attempts, three sends an hour. All of
 * those limits are enforced by the API - this component only drives the
 * exchange, because a limit enforced in the browser is not a limit.
 *
 * In fixtures mode there is no API to send an SMS, so the control explains that
 * and accepts any six digits. It says so on screen rather than silently
 * passing, so nobody mistakes the stub for a working check.
 */
export function PhoneVerify({ phone, purpose, verified, onVerified }: PhoneVerifyProps) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const isStub = apiMode === 'fixtures';
  const phoneValid = /^[6-9]\d{9}$/.test(phone);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function send() {
    setBusy(true);
    setError(null);
    try {
      if (isStub) {
        await new Promise((r) => setTimeout(r, 400));
      } else {
        const res = await fetch('/api/v1/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, purpose }),
        });
        const body = await res.json();
        if (body.error) throw new Error(body.error.message);
      }
      setSent(true);
      setCooldown(30);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'We could not send the code. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (!/^\d{6}$/.test(code)) {
      setError('The code is six digits.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (isStub) {
        await new Promise((r) => setTimeout(r, 400));
        onVerified(`stub-token-${Date.now()}-not-a-real-verification`);
      } else {
        const res = await fetch('/api/v1/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, purpose, code }),
        });
        const body = await res.json();
        if (body.error) throw new Error(body.error.message);
        onVerified(body.data.token as string);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That code did not match. Check it and try again.');
    } finally {
      setBusy(false);
    }
  }

  if (verified) {
    return (
      <Alert tone="positive" title="Phone number confirmed">
        <p>We will use +91 {phone} to call you back about this request.</p>
      </Alert>
    );
  }

  if (!phoneValid) {
    return (
      <Alert tone="info">
        <p>Enter your mobile number above and we will send a code to confirm it.</p>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-card border border-line bg-surface p-2">
      <div>
        <p className="text-body font-medium text-ink">Confirm your number</p>
        <p className="text-small text-ink-soft">
          We send a six-digit code to +91 {phone}. It stops the request queue filling with numbers
          that do not answer, so a coordinator reaches you faster.
        </p>
      </div>

      {isStub ? (
        <Alert tone="attention">
          <p>
            No SMS is sent in this build because the API is not connected. Any six digits will be
            accepted, and the token produced is not a real verification.
          </p>
        </Alert>
      ) : null}

      {error ? (
        <Alert tone="critical" live>
          <p>{error}</p>
        </Alert>
      ) : null}

      {!sent ? (
        <Button type="button" variant="secondary" onClick={send} loading={busy} loadingLabel="Sending the code">
          Send me a code
        </Button>
      ) : (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end">
          <Input
            label="Six-digit code"
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, ''));
              setError(null);
            }}
            fieldClassName="flex-1"
          />
          <div className="flex gap-1">
            <Button type="button" onClick={verify} loading={busy} loadingLabel="Checking the code">
              Confirm
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={send}
              disabled={cooldown > 0 || busy}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
