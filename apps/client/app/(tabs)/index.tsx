import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '@brokerbox/ui';

export default function ClientDashboardScreen() {
  // Mock user deal state for UI verification
  const activeDeal = {
    id: 'DEAL-924-A',
    address: '123 King St West, Condominium',
    status: 'UNDERWRITING',
    loanAmount: 850000,
    rate: '4.85%',
    lender: 'Equitable Bank'
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back, Sarah</Text>
        <Text style={styles.headerTitle}>Your Mortgage Application</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.propertyLabel}>{activeDeal.address}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{activeDeal.status}</Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Requested Amount</Text>
              <Text style={styles.detailValue}>${activeDeal.loanAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Target Rate</Text>
              <Text style={styles.detailValue}>{activeDeal.rate}</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Lender</Text>
              <Text style={styles.detailValue}>{activeDeal.lender}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Application Timeline</Text>

        <View style={styles.timelineCard}>
          <View style={styles.timelineItem}>
            <View style={[styles.node, styles.nodeActive]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Application Submitted</Text>
              <Text style={styles.timelineDate}>Nov 12, 2023</Text>
            </View>
          </View>
          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={[styles.node, styles.nodeActive]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Documents Verified</Text>
              <Text style={styles.timelineDate}>Nov 15, 2023</Text>
            </View>
          </View>
          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={[styles.node, { backgroundColor: COLORS.primary }]} />
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTitle, { color: COLORS.primary }]}>Underwriting Review</Text>
              <Text style={styles.timelineDate}>In Progress - Estimated Nov 22</Text>
            </View>
          </View>
          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={styles.node} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Commitment Issued</Text>
              <Text style={styles.timelineDate}>Pending</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { padding: 24, paddingBottom: 16, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.surface },
  greeting: { fontSize: 16, color: COLORS.muted, marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  content: { padding: 16 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#374151'
  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  propertyLabel: { fontSize: 18, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 12 },
  statusBadge: { backgroundColor: 'rgba(20, 184, 166, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary },
  statusText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#374151', paddingTop: 16 },
  detailBox: { flex: 1 },
  detailLabel: { fontSize: 12, color: COLORS.muted, marginBottom: 4, textTransform: 'uppercase' },
  detailValue: { fontSize: 16, fontWeight: '700', color: COLORS.text },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16, marginLeft: 4 },
  timelineCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1f2937' },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start' },
  node: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#374151', marginTop: 2, marginRight: 16 },
  nodeActive: { backgroundColor: '#10B981' },
  timelineLine: { width: 2, height: 30, backgroundColor: '#374151', marginLeft: 7, marginVertical: 4 },
  timelineContent: { flex: 1 },
  timelineTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  timelineDate: { fontSize: 13, color: COLORS.muted }
});
