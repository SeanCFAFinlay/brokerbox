import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { notFound } from 'next/navigation';
import LenderDealActions from './LenderDealActions';

export const dynamic = 'force-dynamic';

export default async function LenderDealReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Auth validation mock: pick the first active lender
    const { data: lender } = await supabase
        .from('Lender')
        .select('*')
        .eq('status', 'active')
        .limit(1)
        .single();
        
    if (!lender) return <div>No Lender Found</div>;

    const { data: deal, error: dealError } = await supabase
        .from('Deal')
        .select(`
            *,
            borrower:Borrower(*),
            docRequests:DocRequest(*, files:DocumentFile(*))
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
