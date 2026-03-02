import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { COLORS } from '@brokerbox/ui';

const API_URL = 'http://localhost:4000/api';

export default function ClientsScreen() {
    const [clients, setClients] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchClients = async () => {
        try {
            const res = await fetch(`${API_URL}/clients`);
            const json = await res.json();
            if (json.clients) setClients(json.clients);
        } catch {
            setClients([
                { id: '1', firstName: 'Sarah', lastName: 'Chen', email: 'sarah@example.com', kycStatus: 'APPROVED' }
            ]);
        }
    };

    useEffect(() => { fetchClients(); }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchClients();
        setRefreshing(false);
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Client CRM</Text>
            </View>

            <View style={{ padding: 16 }}>
                {clients.map(client => (
                    <TouchableOpacity key={client.id} style={styles.clientCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={styles.clientName}>{client.firstName} {client.lastName}</Text>
                            <Text style={[styles.kycStatus, client.kycStatus === 'APPROVED' ? { color: '#10B981' } : {}]}>
                                {client.kycStatus}
                            </Text>
                        </View>
                        <Text style={styles.clientDetails}>{client.email}</Text>
                        <Text style={styles.clientDetails}>{client.phone || 'No phone'}</Text>

                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statLabel}>Active Deals</Text>
                                <Text style={styles.statValue}>{client.deals?.length || 0}</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statLabel}>Properties</Text>
                                <Text style={styles.statValue}>{client.properties?.length || 0}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.surface },
    headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.text },
    clientCard: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1f2937'
    },
    clientName: { fontSize: 18, fontWeight: '600', color: COLORS.text },
    kycStatus: { fontSize: 12, fontWeight: '700', color: COLORS.muted },
    clientDetails: { fontSize: 14, color: COLORS.muted, marginBottom: 2 },
    statsRow: { flexDirection: 'row', marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.surface, paddingTop: 12 },
    statBox: { flex: 1, alignItems: 'center' },
    statLabel: { fontSize: 12, color: COLORS.muted, marginBottom: 4, textTransform: 'uppercase' },
    statValue: { fontSize: 18, fontWeight: '700', color: COLORS.text }
});
