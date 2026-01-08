import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DollarSign, TrendingUp, Package, Star } from 'lucide-react-native';
import { useDeliveryStore } from '@/stores/deliveryStore';
import EarningsChart from '@/components/EarningsChart';

export default function EarningsScreen() {
  const stats = useDeliveryStore((state) => state.stats);

  const statCards = [
    {
      icon: DollarSign,
      label: 'Today Earnings',
      value: `$${stats.todayEarnings.toFixed(2)}`,
      color: '#48BB78',
      bgColor: '#F0FFF4',
    },
    {
      icon: Package,
      label: 'Today Deliveries',
      value: stats.todayDeliveries.toString(),
      color: '#4C6EF5',
      bgColor: '#EBF4FF',
    },
    {
      icon: TrendingUp,
      label: 'Total Earnings',
      value: `$${stats.totalEarnings.toFixed(2)}`,
      color: '#FF6B35',
      bgColor: '#FFF5F0',
    },
    {
      icon: Star,
      label: 'Average Rating',
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A',
      color: '#F6AD55',
      bgColor: '#FFFAF0',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Earnings</Text>
          <Text style={styles.subtitle}>Track your delivery performance</Text>
        </View>

        <View style={styles.topSummary}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatLabel}>Today's Earnings</Text>
            <Text style={styles.summaryStatValue}>{`$${stats.todayEarnings.toFixed(2)}`}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatLabel}>Today's Deliveries</Text>
            <Text style={styles.summaryStatValue}>{stats.todayDeliveries}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Performance</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Earnings</Text>
            <Text style={styles.summaryValue}>{`$${stats.totalEarnings.toFixed(2)}`}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Average Rating</Text>
            <Text style={styles.summaryValue}>{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.summaryTitle}>Weekly Earnings</Text>
          <EarningsChart data={stats.weeklyEarnings} />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>All Time Stats</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Deliveries</Text>
            <Text style={styles.summaryValue}>{stats.totalDeliveries}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Completion Rate</Text>
            <Text style={styles.summaryValue}>
              {stats.completionRate > 0 ? `${stats.completionRate.toFixed(1)}%` : 'N/A'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
  },
  topSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  summaryStat: { flex: 1 },
  summaryDivider: { width: 1, height: '100%', backgroundColor: '#E2E8F0', marginHorizontal: 12 },
  summaryStatLabel: { fontSize: 12, color: '#718096', marginBottom: 6 },
  summaryStatValue: { fontSize: 22, fontWeight: '700', color: '#2D3748' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    overflow: 'hidden',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#718096',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
  },
});
