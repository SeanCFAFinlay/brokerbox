import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const { data: settingsData, error } = await supabase.from('BrokerageSettings').select('*').eq('id', 'default').maybeSingle();
        let settings = settingsData;

        if (!settings) {
            const { data: newSettings, error: createError } = await supabase.from('BrokerageSettings').insert({ id: 'default', brokerageName: 'BrokerBox Financial Group' }).select().single();
            if (createError) throw createError;
            settings = newSettings;
        }

        const { data: user } = await supabase.from('User').select('outlookEnabled').eq('email', 'broker@demo.com').maybeSingle();

        return NextResponse.json({
            ...settings,
            outlookEnabled: user?.outlookEnabled || false
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { data: old } = await supabase.from('BrokerageSettings').select('*').eq('id', 'default').maybeSingle();

        // Convert numerical inputs
        ['defaultBrokerFee', 'defaultLenderFee', 'defaultTermMonths', 'defaultAmortMonths', 'defaultInterestRate'].forEach(k => {
            if (body[k] !== undefined) body[k] = Number(body[k]);
        });

        const { data: settings, error } = await supabase.from('BrokerageSettings').upsert({ id: 'default', ...body }).select().single();
        if (error) throw error;

        if (old) {
            const diff: any = {};
            for (const key of Object.keys(body)) {
                if ((old as any)[key] !== body[key]) diff[key] = { old: (old as any)[key], new: body[key] };
            }
            await logAudit('Settings', 'default', 'UPDATE', diff);
        } else {
            await logAudit('Settings', 'default', 'CREATE');
        }

        return NextResponse.json(settings);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
