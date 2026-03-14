'use client';

import { useEffect } from 'react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: 24,
        color: 'var(--bb-text)',
      }}
    >
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>Something went wrong</h2>
      <p style={{ fontSize: 14, color: 'var(--bb-muted)', marginBottom: 24, textAlign: 'center' }}>
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          padding: '10px 20px',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--bb-bg)',
          background: 'var(--bb-accent)',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  );
}
