import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, StatusPill } from '@brokerbox/ui';

export default function LenderPipelineScreen() {
  // Mock incoming matched deals for the lender
  const deals = [
    { id: 'DEAL-924-A', address: '123 King St West', amount: 850000, ltv: '68%', status: 'MATCHED', date: 'Nov 14' },
    { id: 'DEAL-811-B', address: '45 Queen St East', amount: 420000, ltv: '75%', status: 'REVIEWING', date: 'Nov 12' },
    { id: 'DEAL-702-C', address: '88 Hastings Ave', amount: 1150000, ltv: '65%', status: 'COMMITTED', date: 'Nov 10' }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbound Pipeline</Text>
        <Text style={styles.headerSubtitle}>Deals matched to your lending criteria</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Active Matches</Text>
          <Text style={styles.statValue}>14</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Volume Request</Text>
          <Text style={styles.statValue}>$12.4M</Text>
        </View>
      </View>

      <View style={{ padding: 16 }}>
        {deals.map(deal => (
          <TouchableOpacity key={deal.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.dealAddress}>{deal.address}</Text>
              <StatusPill status={deal.status} />
            </View>

            <View style={styles.cardMetrics}>
              <View>
                <Text style={styles.metricLabel}>Amount</Text>
                <Text style={styles.metricValue}>${deal.amount.toLocaleString()}</Text>
              </View>
              <View>
                <Text style={styles.metricLabel}>LTV</Text>
                <Text style={styles.metricValue}>{deal.ltv}</Text>
              </View>
              <View>
                <Text style={styles.metricLabel}>Matched</Text>
                <Text style={styles.metricValue}>{deal.date}</Text>
              </View>
            </View>

            {deal.status === 'MATCHED' && (
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}>
                  <Text style={[styles.actionText, { color: '#0B0F14' }]}>Review Deal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#374151' }]}>
                  <Text style={styles.actionText}>Decline</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.surface },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: COLORS.muted },
  statsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.surface, padding: 16 },
  statBox: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 12, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1f2937' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  dealAddress: { fontSize: 16, fontWeight: '700', color: COLORS.text, flex: 1 },
  cardMetrics: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#374151' },
  metricLabel: { fontSize: 12, color: COLORS.muted, marginBottom: 4 },
  metricValue: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  actionText: { fontWeight: '600', color: COLORS.text, fontSize: 14 }
});
