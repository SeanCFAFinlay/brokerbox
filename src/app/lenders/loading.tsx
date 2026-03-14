import s from '@/styles/shared.module.css';

export default function LendersLoading() {
  return (
    <div className={s.pageHeader} style={{ padding: '40px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ width: 120, height: 28, background: 'var(--bb-border)', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ width: 240, height: 16, background: 'var(--bb-bg-secondary)', borderRadius: 4 }} />
      </div>
      <div className={s.card} style={{ minHeight: 200 }} />
    </div>
  );
}
