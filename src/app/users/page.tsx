import { supabase } from '@/lib/supabase';
import UsersClient from './UsersClient';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
    const { data: users } = await supabase
        .from('User')
        .select('*')
        .order('createdAt', { ascending: false });

    return (
        <UsersClient users={(users || []) as any} />
    );
}
