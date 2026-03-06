import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { KpiCard } from '../../components/KpiCard';

const COLORS = {
  bg: '#0B0F14',
  card: '#121822',
  surface: '#161D29',
  primary: '#14B8A6',
  text: '#E5E7EB',
  muted: '#6B7280',
};

// Ensure API URL points to local machine if running on iOS simulator or device
// Typically http://localhost:8081 or http://10.0.2.2:8081
const API_URL = 'http://localhost:8081/api';

export default function DashboardScreen() {
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // In a real Expo app, relative paths work for web, but native needs an absolute URL.
      // We'll try relative first which works if we're testing on web. 
      // Replace with your local IP if running on a real device.
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.warn("API Fetch failed. Using fallback data for Native preview.");
      // Fallback if fetch fails (e.g. running native simulator without absolute URL)
      setData({
        kpis: {
          activeDeals: 14,
          capitalAvailable: 850000000,
          fundedMtd: 12500000,
          avgDaysToFund: 22,
          closeRate: 68
        },
        activities: [
          { id: 1, title: 'Deal moved to Underwriting', description: 'Condo Purchase - King St' },
          { id: 2, title: 'Lender Matches Found', description: 'Found 2 lenders for Hastings Refinance' }
        ],
        lenders: []
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  if (!data) {
    return (
      <View style={styles.container}>
        <Text style={{ color: COLORS.text, padding: 20 }}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Overview</Text>
      </View>

      <View style={styles.kpiGrid}>
        <KpiCard title="Active Deals" value={data.kpis.activeDeals.toString()} subtitle="3 closing this week" />
        <KpiCard title="Capital Avail." value={formatCurrency(data.kpis.capitalAvailable)} subtitle="Across 4 lending tiers" />
        <KpiCard title="Funded MTD" value={formatCurrency(data.kpis.fundedMtd)} />
        <KpiCard title="Avg Days to Fund" value={`${data.kpis.avgDaysToFund} days`} />
        <KpiCard title="Close Rate" value={`${data.kpis.closeRate}%`} subtitle="+4% from last month" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.listCard}>
          {data.activities.map((act: any) => (
            <View key={act.id} style={styles.listItem}>
              <View style={styles.bullet} />
              <View>
                <Text style={styles.listTitle}>{act.title}</Text>
                {act.description && <Text style={styles.listSubtitle}>{act.description}</Text>}
              </View>
            </View>
          ))}
          {data.activities.length === 0 && <Text style={{ color: COLORS.muted }}>No recent activity.</Text>}
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  listCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 12,
  },
  listTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  listSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 2,
  }
});
