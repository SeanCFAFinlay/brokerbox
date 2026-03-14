'use client';
import { useState, useEffect, useCallback } from 'react';
import s from '@/styles/shared.module.css';

interface Note {
    id: string;
    content: string;
    createdBy: string;
    createdAt: string;
}

interface NoteTimelineProps {
    entityType: string;
    entityId: string;
}

export default function NoteTimeline({ entityType, entityId }: NoteTimelineProps) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState('');
    const [saving, setSaving] = useState(false);

    const loadNotes = useCallback(() => {
        fetch(`/api/notes?entityType=${entityType}&entityId=${entityId}`)
            .then(r => r.json())
            .then(setNotes);
    }, [entityType, entityId]);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    async function handleAdd() {
        if (!newNote.trim()) return;
        setSaving(true);
        const res = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entityType, entityId, content: newNote }),
        });
        if (res.ok) {
            setNewNote('');
            loadNotes();
        }
        setSaving(false);
    }

    return (
        <div className={s.card}>
            <div className={s.cardTitle}>Notes & Activity</div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                    className={s.formInput}
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    style={{ flex: 1 }}
                />
                <button
                    className={`${s.btn} ${s.btnPrimary} ${s.btnSmall}`}
                    onClick={handleAdd}
                    disabled={saving || !newNote.trim()}
                >
                    {saving ? '...' : 'Add'}
                </button>
            </div>

            {notes.length === 0 ? (
                <div className={s.emptyState} style={{ padding: 16, fontSize: 13 }}>No notes yet.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {notes.map(note => (
                        <div key={note.id} style={{
                            padding: 12,
                            backgroundColor: 'var(--bb-bg)',
                            borderRadius: 8,
                            borderLeft: '3px solid var(--bb-accent)',
                        }}>
                            <div style={{ fontSize: 14, color: 'var(--bb-text)', lineHeight: 1.5 }}>{note.content}</div>
                            <div style={{ fontSize: 11, color: 'var(--bb-muted)', marginTop: 6, display: 'flex', gap: 12 }}>
                                <span>{note.createdBy}</span>
                                <span>{new Date(note.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
