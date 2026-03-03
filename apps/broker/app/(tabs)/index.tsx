import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { KpiCard, COLORS } from '@brokerbox/ui';
import { Image } from 'react-native';

// Using local proxy until dynamic env resolution is in place
const API_URL = 'http://localhost:4000/api';

export default function DashboardScreen() {
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.warn("API Fetch failed. Using fallback data for Native preview.", e);
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
    <View style={styles.mainWrapper}>
      {/* Sidebar Section */}
      <View style={styles.sidebar}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/icon.png')} // Fixed path and using existing icon.png
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.logoBrand}>Broker Box</Text>
            <Text style={styles.logoCompany}>Technologies Inc.</Text>
          </View>
        </View>
      </View>

      {/* Main Content Area */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.bg,
  },
  sidebar: {
    width: 280,
    backgroundColor: COLORS.card,
    borderRightWidth: 1,
    borderRightColor: COLORS.surface,
    padding: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  logoBrand: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  logoCompany: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    padding: 32,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    justifyContent: 'space-between',
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
    fontSize: 16,
    fontWeight: '600',
  },
  listSubtitle: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 4,
  }
});
