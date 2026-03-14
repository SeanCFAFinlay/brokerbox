import s from '@/styles/shared.module.css';

export default function DealsLoading() {
  return (
    <div className={s.pageHeader} style={{ padding: '40px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ width: 200, height: 28, background: 'var(--bb-border)', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ width: 320, height: 16, background: 'var(--bb-bg-secondary)', borderRadius: 4 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={s.kpiCard} style={{ minHeight: 100 }} />
        ))}
      </div>
    </div>
  );
}
