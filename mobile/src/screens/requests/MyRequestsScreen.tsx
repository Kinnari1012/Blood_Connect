import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { RequestCard } from '../../components/request/RequestCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { requestsApi } from '../../api/requests.api';
import { BloodRequest } from '../../types';
import { ROUTES } from '../../constants/routes';

export const MyRequestsScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'FULFILLED'>('ALL');
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await requestsApi.getMyRequests();
      if (res.success && res.data) {
        setRequests(res.data);
      } else {
        setRequests([]);
      }
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'ACTIVE') {
      return (
        r.status === 'Searching Donors' ||
        r.status === 'Donor Found' ||
        r.status === 'Pending Verification' ||
        r.status === 'Partially Fulfilled'
      );
    }
    if (activeTab === 'FULFILLED') {
      return r.status === 'Fulfilled';
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Blood Requests</Text>
          <Text style={styles.headerSubtitle}>Track and manage your requests</Text>
        </View>

        <Button
          title="New Request"
          onPress={() => navigation.navigate(ROUTES.CREATE_REQUEST)}
          size="sm"
          icon="plus"
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        {(['ALL', 'ACTIVE', 'FULFILLED'] as const).map((tab) => {
          const isSelected = activeTab === tab;
          const label = tab === 'ALL' ? 'All' : tab === 'ACTIVE' ? 'Active' : 'Fulfilled';
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id || item.requestId || String(Math.random())}
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            onPress={() =>
              navigation.navigate(ROUTES.REQUEST_DETAILS, {
                requestId: item.id || item._id,
                request: item,
              })
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="droplet"
              title="No Blood Requests"
              description={
                activeTab === 'ALL'
                  ? 'You have not submitted any blood donation requests yet.'
                  : `No ${activeTab.toLowerCase()} requests found.`
              }
              actionTitle="Create Request"
              onAction={() => navigation.navigate(ROUTES.CREATE_REQUEST)}
            />
          ) : undefined
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
});
