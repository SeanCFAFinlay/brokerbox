import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const COLORS = {
    bg: '#0B0F14',
    card: '#121822',
    surface: '#161D29',
    primary: '#14B8A6',
    text: '#E5E7EB',
    muted: '#6B7280',
};

export default function DealDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [deal, setDeal] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeal = async () => {
            try {
                const res = await fetch(`/api/deals/${id}`);
                const json = await res.json();
                if (json.deal) {
                    setDeal(json.deal);
                }
            } catch (e) {
                console.warn('API Fetch failed. Using fallback.');
                setDeal({
                    id,
                    title: 'Fallback Deal view',
                    stage: 'COMMITTED',
                    loanAmount: 950000,
                    property: { address: 'Offline Mode Address', value: 1250000 },
                    parties: [{ role: 'PRIMARY_BORROWER', client: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' } }],
                    scenarios: []
                });
            } finally {
                setLoading(false);
            }
        };
        fetchDeal();
    }, [id]);

    if (loading) {
        return <View style={styles.center}><ActivityIndicator color={COLORS.primary} /></View>;
    }

    if (!deal) {
        return <View style={styles.center}><Text style={{ color: COLORS.text }}>Deal not found.</Text></View>;
    }

    const borrower = deal.parties?.find((p: any) => p.role === 'PRIMARY_BORROWER')?.client;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
                    <Text style={{ color: COLORS.primary }}>← Back to Pipeline</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{deal.title}</Text>
                <Text style={styles.subtitle}>{deal.stage.replace('_', ' ')} • ${deal.loanAmount?.toLocaleString()}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Client Summary</Text>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{borrower?.firstName} {borrower?.lastName}</Text>
                    <Text style={styles.cardText}>{borrower?.email || 'No email provided'}</Text>
                    <Text style={styles.cardText}>Credit Score: {borrower?.creditScore || 'N/A'}</Text>
                    <Text style={styles.cardText}>Income: ${borrower?.monthlyIncome?.toLocaleString() || 0}/mo</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Property</Text>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{deal.property?.address || 'TBD'}</Text>
                    <Text style={styles.cardText}>Est. Value: ${deal.property?.value?.toLocaleString() || 0}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Scenarios</Text>
                {deal.scenarios?.length > 0 ? (
                    deal.scenarios.map((scen: any) => (
                        <View key={scen.id} style={styles.card}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.cardTitle}>{scen.name}</Text>
                                {scen.isRecommended && <Text style={{ color: COLORS.primary, fontSize: 12 }}>Recommended</Text>}
                            </View>
                            <Text style={styles.cardText}>Total Amount: ${scen.totalAmount?.toLocaleString()}</Text>
                            {scen.tranches?.map((t: any) => (
                                <Text key={t.id} style={[styles.cardText, { marginLeft: 8, marginTop: 4 }]}>
                                    • {t.position}nd Mortgage: ${t.amount.toLocaleString()} @ {(t.rate * 100).toFixed(2)}%
                                </Text>
                            ))}
                        </View>
                    ))
                ) : (
                    <View style={styles.card}>
                        <Text style={styles.cardText}>No scenarios built yet.</Text>
                    </View>
                )}
            </View>

            <View style={[styles.section, { marginBottom: 40 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Documents</Text>
                    <TouchableOpacity style={styles.uploadButton}>
                        <Text style={styles.uploadButtonText}>+ Upload</Text>
                    </TouchableOpacity>
                </View>

                {deal.documents?.length > 0 ? (
                    deal.documents.map((doc: any) => (
                        <View key={doc.id} style={styles.card}>
                            <Text style={styles.cardTitle}>{doc.name}</Text>
                            <Text style={styles.cardText}>{doc.type} • {doc.sizeBytes ? (doc.sizeBytes / 1024).toFixed(1) + ' KB' : 'Unknown size'}</Text>
                            <TouchableOpacity style={{ marginTop: 8 }}>
                                <Text style={{ color: COLORS.primary }}>View Document</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <View style={styles.card}>
                        <Text style={styles.cardText}>No documents uploaded for this deal.</Text>
                        <Text style={[styles.cardText, { fontSize: 12, marginTop: 4 }]}>Supported formats: PDF, JPG, PNG.</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    center: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.surface },
    title: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
    subtitle: { fontSize: 16, color: COLORS.muted, fontWeight: '500' },
    section: { padding: 20, paddingBottom: 0 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
    card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#1f2937' },
    cardTitle: { color: COLORS.text, fontSize: 16, fontWeight: '600', marginBottom: 8 },
    cardText: { color: COLORS.muted, fontSize: 14, marginBottom: 4 },
    uploadButton: { backgroundColor: 'rgba(20, 184, 166, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary },
    uploadButtonText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' }
});
