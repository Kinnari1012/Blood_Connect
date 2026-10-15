import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import { adminApi } from '../../api/admin.api';
import { ROUTES } from '../../constants/routes';

export const AdminHomeScreen = ({ navigation }: any) => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalDonors: 0,
    totalSeekers: 0,
    availableDonors: 0,
    activeRequests: 0,
    emergencyRequests: 0,
    completedRequests: 0,
    totalAdmins: 0,
  });
  const [_loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAnalyticsOverview();
      if (res.success && res.data) {
        setMetrics(res.data);
      }
    } catch {
      // Keep initial
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOverview();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Admin Portal"
        subtitle="Platform Management & Oversight"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>System Overview</Text>

        {/* Stats Grid */}
        <View style={styles.metricsGrid}>
          <Card variant="flat" style={styles.metricCard}>
            <Icon name="users" size={22} color={Colors.info} />
            <Text style={styles.metricVal}>{metrics.totalUsers}</Text>
            <Text style={styles.metricLabel}>Total Users</Text>
          </Card>

          <Card variant="flat" style={styles.metricCard}>
            <Icon name="droplet" size={22} color={Colors.normal} />
            <Text style={styles.metricVal}>{metrics.availableDonors}</Text>
            <Text style={styles.metricLabel}>Available Donors</Text>
          </Card>

          <Card variant="flat" style={styles.metricCard}>
            <Icon name="alert-triangle" size={22} color={Colors.emergency} />
            <Text style={[styles.metricVal, { color: Colors.emergency }]}>
              {metrics.emergencyRequests}
            </Text>
            <Text style={styles.metricLabel}>Emergency Requests</Text>
          </Card>

          <Card variant="flat" style={styles.metricCard}>
            <Icon name="check-circle" size={22} color={Colors.primary} />
            <Text style={styles.metricVal}>{metrics.completedRequests}</Text>
            <Text style={styles.metricLabel}>Completed</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Management Tools</Text>

        <Card style={styles.toolCard}>
          <TouchableOpacity
            style={styles.toolRow}
            onPress={() => navigation.navigate(ROUTES.USER_MANAGEMENT)}
            activeOpacity={0.7}
          >
            <View style={[styles.toolIcon, { backgroundColor: '#EFF6FF' }]}>
              <Icon name="users" size={20} color={Colors.info} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.toolTitle}>User & Donor Management</Text>
              <Text style={styles.toolSub}>View accounts, roles and manage status</Text>
            </View>
            <Icon name="chevron-right" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </Card>

        <Card style={styles.toolCard}>
          <TouchableOpacity
            style={styles.toolRow}
            onPress={() => navigation.navigate(ROUTES.MY_REQUESTS)}
            activeOpacity={0.7}
          >
            <View style={[styles.toolIcon, { backgroundColor: Colors.primaryLight }]}>
              <Icon name="file-text" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.toolTitle}>Request Verification Queue</Text>
              <Text style={styles.toolSub}>Approve or reject active blood requests</Text>
            </View>
            <Icon name="chevron-right" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  toolCard: {
    padding: 0,
    marginBottom: 12,
    overflow: 'hidden',
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  toolIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  toolSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
