export default function RootLoading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: 'var(--bb-muted)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          className="loading-spinner"
          style={{
            width: 40,
            height: 40,
            border: '3px solid var(--bb-border)',
            borderTopColor: 'var(--bb-accent)',
            borderRadius: '50%',
            margin: '0 auto 16px',
          }}
        />
        <div style={{ fontSize: 14 }}>Loading…</div>
      </div>
    </div>
  );
}
