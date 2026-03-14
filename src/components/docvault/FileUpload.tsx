'use client';
import { useState, useRef } from 'react';
import s from '@/styles/shared.module.css';

interface FileUploadProps {
    borrowerId: string;
    docType: string;
    category: string;
    onUploadSuccess?: () => void;
}

export default function FileUpload({ borrowerId, docType, category, onUploadSuccess }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('borrowerId', borrowerId);
        formData.append('docType', docType);
        formData.append('category', category);

        try {
            const res = await fetch('/api/docvault', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                alert('File uploaded successfully!');
                if (onUploadSuccess) onUploadSuccess();
            } else {
                const err = await res.json();
                alert(`Upload failed: ${err.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <button
                className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
            >
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
}
