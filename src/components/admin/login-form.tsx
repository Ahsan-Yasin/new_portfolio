'use client';

import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useActionState, useState, useSyncExternalStore } from 'react';
import { loginAction, type LoginState } from '@/app/admin/actions';
import { hasRecovery } from './recovery';

const INITIAL: LoginState = {};
const subscribeNever = () => () => {};
const readNoRecovery = () => false;

export function LoginForm({ siteName }: { siteName: string }) {
  const [state, action, pending] = useActionState(loginAction, INITIAL);
  const [visible, setVisible] = useState(false);
  const recovered = useSyncExternalStore(subscribeNever, hasRecovery, readNoRecovery);

  return (
    <form className="a-login-card" action={action}>
      <h1 className="a-login-title">{siteName}</h1>
      <p className="a-login-text">Sign in to edit your site.</p>

      {recovered ? (
        <p className="a-login-note" role="status">
          You were signed out. Your latest edits are safe on this device, and you can restore them after you sign in.
        </p>
      ) : null}

      <label className="a-login-label" htmlFor="password">
        Password
      </label>
      <span className="a-login-field">
        <input
          id="password"
          name="password"
          type={visible ? 'text' : 'password'}
          autoComplete="current-password"
          autoFocus
          required
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? 'password-error' : undefined}
        />
        <button
          type="button"
          className="a-login-eye"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
        </button>
      </span>

      {state.error ? (
        <p className="a-login-error" id="password-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button type="submit" className="a-button is-tint a-login-submit" disabled={pending}>
        {pending ? <LoaderCircle size={15} className="a-spin" aria-hidden /> : null}
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
