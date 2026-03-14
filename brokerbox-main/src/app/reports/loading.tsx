import s from '@/styles/shared.module.css';

export default function ReportsLoading() {
  return (
    <div style={{ padding: '40px' }}>
      <div className={s.pageHeader} style={{ marginBottom: 24 }}>
        <div style={{ width: 280, height: 28, background: 'var(--bb-border)', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ width: 400, height: 16, background: 'var(--bb-bg-secondary)', borderRadius: 4 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={s.kpiCard} style={{ minHeight: 90 }} />
        ))}
      </div>
      <div className={s.card} style={{ minHeight: 200 }} />
    </div>
  );
}
