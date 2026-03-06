import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';

const COLORS = {
    bg: '#0B0F14',
    card: '#121822',
    surface: '#161D29',
    primary: '#14B8A6',
    text: '#E5E7EB',
    muted: '#6B7280',
};

export default function LendersScreen() {
    const [lenders, setLenders] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLenders = async () => {
        try {
            const res = await fetch('/api/lenders');
            const json = await res.json();
            if (json.lenders) setLenders(json.lenders);
        } catch {
            setLenders([
                { id: '1', name: 'Equitable Bank', type: 'A_LENDER', products: [{ name: 'Prime 1st' }] },
                { id: '2', name: 'Home Trust', type: 'B_LENDER', products: [{ name: 'Alt-A 1st' }] }
            ]);
        }
    };

    useEffect(() => { fetchLenders(); }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchLenders();
        setRefreshing(false);
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Lender Directory</Text>
                <Text style={styles.headerSubtitle}>Manage lending criteria and products</Text>
            </View>

            <View style={{ padding: 16 }}>
                {lenders.map(lender => {
                    const latestCriteria = lender.criteria?.[0]?.rulesJson
                        ? JSON.parse(lender.criteria[0].rulesJson)
                        : null;

                    return (
                        <View key={lender.id} style={styles.lenderCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.lenderName}>{lender.name}</Text>
                                <View style={styles.typeBadge}>
                                    <Text style={styles.typeText}>{lender.type.replace('_', ' ')}</Text>
                                </View>
                            </View>

                            <Text style={styles.sectionTitle}>Products</Text>
                            {lender.products?.map((p: any) => (
                                <Text key={p.id} style={styles.textLighter}>• {p.name} (Position: {p.position}nd)</Text>
                            ))}

                            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Current Underwriting Criteria (v{lender.criteria?.[0]?.version || 1})</Text>
                            {latestCriteria ? (
                                <View style={styles.criteriaBox}>
                                    {latestCriteria.maxLtv && <Text style={styles.criteriaText}>Max LTV: {latestCriteria.maxLtv}%</Text>}
                                    {latestCriteria.minCredit && <Text style={styles.criteriaText}>Min Credit: {latestCriteria.minCredit}</Text>}
                                    {latestCriteria.maxGds && <Text style={styles.criteriaText}>Max GDS/TDS: {latestCriteria.maxGds}% / {latestCriteria.maxTds}%</Text>}
                                    {latestCriteria.allowedRegions && (
                                        <Text style={styles.criteriaText}>Regions: {latestCriteria.allowedRegions.join(', ')}</Text>
                                    )}
                                    {latestCriteria.allowedPropertyTypes && (
                                        <Text style={styles.criteriaText}>Property Types: {latestCriteria.allowedPropertyTypes.join(', ')}</Text>
                                    )}
                                </View>
                            ) : (
                                <Text style={styles.textLighter}>No generic criteria specified.</Text>
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
    header: { padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.surface },
    headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
    headerSubtitle: { fontSize: 14, color: COLORS.muted },
    lenderCard: {
        backgroundColor: COLORS.card,
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1f2937'
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    lenderName: { fontSize: 18, fontWeight: '600', color: COLORS.text, flex: 1 },
    typeBadge: { backgroundColor: '#cffafe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    typeText: { color: '#0891b2', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.muted, marginBottom: 8, textTransform: 'uppercase' },
    textLighter: { color: COLORS.text, fontSize: 14, marginBottom: 4 },
    criteriaBox: { backgroundColor: COLORS.surface, borderRadius: 8, padding: 12 },
    criteriaText: { color: COLORS.text, fontSize: 14, marginBottom: 6, fontFamily: 'monospace' }
});
