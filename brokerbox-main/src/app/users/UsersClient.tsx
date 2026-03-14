'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import s from '@/styles/shared.module.css';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    baseCommissionSplit: number;
    createdAt: string;
}

export default function UsersClient({ users }: { users: User[] }) {
    const router = useRouter();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ role: string, baseCommissionSplit: number }>({ role: 'broker', baseCommissionSplit: 50 });
    const [loading, setLoading] = useState(false);

    function startEdit(user: User) {
        setEditingId(user.id);
        setEditForm({ role: user.role, baseCommissionSplit: user.baseCommissionSplit });
    }

    async function handleSave(id: string) {
        setLoading(true);
        const res = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm)
        });
        setLoading(false);
        if (res.ok) {
            setEditingId(null);
            router.refresh();
        } else {
            alert('Failed to update user');
        }
    }

    return (
        <>
            <div className={s.pageHeader}>
                <div>
                    <h1>👥 User Management</h1>
                    <p>Manage system access, roles, and default commission splits</p>
                </div>
            </div>

            <div className={s.card}>
                <table className={s.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Base Split (%)</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => {
                            const isEditing = editingId === user.id;

                            return (
                                <tr key={user.id}>
                                    <td style={{ fontWeight: 600 }}>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        {isEditing ? (
                                            <select
                                                className={s.formInput}
                                                style={{ padding: '4px 8px', width: 'auto' }}
                                                value={editForm.role}
                                                onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                            >
                                                <option value="broker">Broker</option>
                                                <option value="admin">Administrator</option>
                                                <option value="readonly">Read Only</option>
                                            </select>
                                        ) : (
                                            <span className={`${s.pill} ${user.role === 'admin' ? s.pillBlue : s.pillGray}`}>
                                                {user.role}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                className={s.formInput}
                                                style={{ width: 80, padding: '4px 8px' }}
                                                value={editForm.baseCommissionSplit}
                                                onChange={e => setEditForm({ ...editForm, baseCommissionSplit: Number(e.target.value) })}
                                            />
                                        ) : (
                                            <span style={{ fontWeight: 600 }}>{user.baseCommissionSplit}%</span>
                                        )}
                                    </td>
                                    <td style={{ color: 'var(--bb-muted)', fontSize: 13 }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {isEditing ? (
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button onClick={() => setEditingId(null)} className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`}>Cancel</button>
                                                <button onClick={() => handleSave(user.id)} className={`${s.btn} ${s.btnPrimary} ${s.btnSmall}`} disabled={loading}>Save</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => startEdit(user)} className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`}>Edit</button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className={s.emptyState}>No users found in the system.</div>
                )}
            </div>
        </>
    );
}
