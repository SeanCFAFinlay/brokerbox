import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { COLORS, StatusPill } from '@brokerbox/ui';

const STAGES = ['NEW', 'DOCS_REQUESTED', 'IN_REVIEW', 'SUBMITTED', 'COMMITTED', 'FUNDED', 'CLOSED', 'LOST'];
const API_URL = 'http://localhost:4000/api';

export default function PipelineScreen() {
    const [deals, setDeals] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDeals = async () => {
        try {
            const res = await fetch(`${API_URL}/deals`);
            const json = await res.json();
            if (json.deals) setDeals(json.deals);
        } catch {
            setDeals([
                { id: '1', title: 'Condo Purchase - King St', stage: 'IN_REVIEW', loanAmount: 680000, parties: [{ role: 'PRIMARY_BORROWER', client: { firstName: 'Sarah', lastName: 'Chen' } }] },
                { id: '2', title: 'Hastings Refinance', stage: 'COMMITTED', loanAmount: 950000, parties: [{ role: 'PRIMARY_BORROWER', client: { firstName: 'James', lastName: 'Patterson' } }] }
            ]);
        }
    };

    useEffect(() => { fetchDeals(); }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDeals();
        setRefreshing(false);
    };

    const StageColumn = ({ stage }: { stage: string }) => {
        const stageDeals = deals.filter(d => d.stage === stage);

        return (
            <View style={styles.column}>
                <View style={styles.columnHeader}>
                    <Text style={styles.columnTitle}>{stage.replace('_', ' ')}</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{stageDeals.length}</Text>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {stageDeals.map(deal => {
                        const borrower = deal.parties?.find((p: any) => p.role === 'PRIMARY_BORROWER')?.client;
                        const borrowerName = borrower ? `${borrower.firstName} ${borrower.lastName}` : 'Unknown';
                        return (
                            <TouchableOpacity
                                key={deal.id}
                                style={styles.dealCard}
                                onPress={() => router.push(`/pipeline/${deal.id}`)}
                            >
                                <Text style={styles.dealName}>{borrowerName}</Text>
                                <Text style={styles.dealAmount}>
                                    ${deal.loanAmount?.toLocaleString()}
                                </Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={[styles.dealTitle, { flex: 1, marginRight: 8 }]} numberOfLines={1}>{deal.title}</Text>
                                    <StatusPill status={deal.stage} />
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Deal Pipeline</Text>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            >
                {STAGES.map(stage => <StageColumn key={stage} stage={stage} />)}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surface,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
    },
    column: {
        width: 280,
        marginRight: 16,
        paddingTop: 16,
    },
    columnHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    columnTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.muted,
        marginRight: 8,
    },
    countBadge: {
        backgroundColor: COLORS.surface,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    countText: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: '600',
    },
    dealCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    dealName: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    dealAmount: {
        color: COLORS.primary,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    dealTitle: {
        color: COLORS.muted,
        fontSize: 13,
    }
});
