import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { COLORS } from '@brokerbox/ui';

const API_URL = 'http://localhost:4000/api';

export default function LendersScreen() {
    const [deals, setDeals] = useState<any[]>([]);

    const fetchData = async () => {
        setRefreshing(true);
        try {
            const [lenderRes, dealRes] = await Promise.all([
                fetch(`${API_URL}/lenders`),
                fetch(`${API_URL}/deals`)
            ]);
            const lenderJson = await lenderRes.json();
            const dealJson = await dealRes.json();

            if (lenderJson.lenders) setLenders(lenderJson.lenders);
            if (dealJson.deals) setDeals(dealJson.deals);
        } catch {
            // Fallback for demo
            setLenders([
                { id: '1', name: 'Equitable Bank', type: 'A_LENDER', products: [{ id: 'p1', name: 'Prime 1st', position: 1 }], criteria: [{ version: 1, rulesJson: JSON.stringify({ maxLtv: 80, minCredit: 680, allowedRegions: ['ON', 'BC'] }) }] },
                { id: '2', name: 'Fisgard Capital', type: 'PRIVATE_LENDER', products: [{ id: 'p2', name: 'Private 1st', position: 1 }], criteria: [{ version: 2, rulesJson: JSON.stringify({ maxLtv: 75, minCredit: 500, allowedRegions: ['ON', 'BC', 'AB'] }) }] },
                { id: '3', name: 'Home Trust', type: 'B_LENDER', products: [{ id: 'p3', name: 'Alt-A 1st', position: 1 }], criteria: [{ version: 1, rulesJson: JSON.stringify({ maxLtv: 80, minCredit: 600, allowedRegions: ['ON'] }) }] }
            ]);
            setDeals([
                { id: 'd1', title: 'Condo Purchase - King St', loanAmount: 680000, value: 850000, creditScore: 720, region: 'ON' },
                { id: 'd2', title: 'Private Refi - Oak Rd', loanAmount: 500000, value: 700000, creditScore: 550, region: 'AB' }
            ]);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const onRefresh = () => fetchData();

    const getMatchesForLender = (lenderCriteria: any) => {
        if (!lenderCriteria) return [];
        return deals.filter(deal => {
            const ltv = (deal.loanAmount / deal.value) * 100;
            const regionMatch = !lenderCriteria.allowedRegions || lenderCriteria.allowedRegions.includes(deal.region);
            const ltvMatch = !lenderCriteria.maxLtv || ltv <= lenderCriteria.maxLtv;
            const creditMatch = !lenderCriteria.minCredit || deal.creditScore >= lenderCriteria.minCredit;
            return regionMatch && ltvMatch && creditMatch;
        });
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Lender Matching</Text>
                <Text style={styles.headerSubtitle}>Automatically matching deals to private & institutional criteria</Text>
            </View>

            <View style={{ padding: 16 }}>
                {lenders.map(lender => {
                    const latestCriteria = lender.criteria?.[0]?.rulesJson
                        ? JSON.parse(lender.criteria[0].rulesJson)
                        : null;

                    const matches = getMatchesForLender(latestCriteria);

                    return (
                        <View key={lender.id} style={[styles.lenderCard, matches.length > 0 && styles.matchedCard]}>
                            <View style={styles.cardHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.lenderName}>{lender.name}</Text>
                                    <View style={[styles.typeBadge, lender.type === 'PRIVATE_LENDER' && { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                                        <Text style={[styles.typeText, lender.type === 'PRIVATE_LENDER' && { color: COLORS.secondary }]}>
                                            {lender.type.replace('_', ' ')}
                                        </Text>
                                    </View>
                                </View>
                                {matches.length > 0 && (
                                    <View style={styles.matchIndicator}>
                                        <Text style={styles.matchText}>{matches.length} MATCHING DEALS</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.criteriaRow}>
                                <View style={styles.criteriaItem}>
                                    <Text style={styles.criteriaLabel}>Max LTV</Text>
                                    <Text style={styles.criteriaValue}>{latestCriteria?.maxLtv || '--'}%</Text>
                                </View>
                                <View style={styles.criteriaItem}>
                                    <Text style={styles.criteriaLabel}>Min Credit</Text>
                                    <Text style={styles.criteriaValue}>{latestCriteria?.minCredit || '--'}</Text>
                                </View>
                                <View style={styles.criteriaItem}>
                                    <Text style={styles.criteriaLabel}>Products</Text>
                                    <Text style={styles.criteriaValue}>{lender.products?.length || 0}</Text>
                                </View>
                            </View>

                            {matches.length > 0 && (
                                <View style={styles.matchList}>
                                    <Text style={styles.matchListTitle}>Eligible Deals:</Text>
                                    {matches.map(deal => (
                                        <View key={deal.id} style={styles.matchItem}>
                                            <Text style={styles.matchItemText}>• {deal.title}</Text>
                                            <Text style={styles.matchItemAmount}>${(deal.loanAmount / 1000).toFixed(0)}k</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
    headerSubtitle: { fontSize: 16, color: COLORS.muted, lineHeight: 22 },
    lenderCard: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
    },
    matchedCard: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(6, 182, 212, 0.05)',
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    lenderName: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
    typeBadge: {
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start'
    },
    typeText: { color: COLORS.primary, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
    matchIndicator: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    matchText: { color: '#000', fontSize: 10, fontWeight: '900' },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16, opacity: 0.5 },
    criteriaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    criteriaItem: { flex: 1 },
    criteriaLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
    criteriaValue: { fontSize: 18, fontWeight: '700', color: COLORS.text },
    matchList: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        padding: 12,
        marginTop: 8,
    },
    matchListTitle: { fontSize: 12, fontWeight: '700', color: COLORS.primary, marginBottom: 8, textTransform: 'uppercase' },
    matchItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    matchItemText: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
    matchItemAmount: { color: COLORS.muted, fontSize: 14 },
});
