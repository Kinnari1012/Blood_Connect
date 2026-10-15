import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Icon } from '../../components/common/Icon';
import { DonorCard } from '../../components/donor/DonorCard';
import { EmptyState } from '../../components/common/EmptyState';
import { donorsApi } from '../../api/donors.api';
import { BLOOD_GROUPS } from '../../constants/bloodGroups';
import { DonorProfile } from '../../types';
import { ROUTES } from '../../constants/routes';

export const FindDonorsScreen = ({ navigation, route }: any) => {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>(route?.params?.bloodGroup || '');
  const [searchCity, setSearchCity] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'AVAILABLE' | 'UNAVAILABLE'>('ALL');
  const [donors, setDonors] = useState<DonorProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDonors = useCallback(async () => {
    try {
      setLoading(true);
      const availabilityParam =
        availabilityFilter === 'AVAILABLE' ? true : availabilityFilter === 'UNAVAILABLE' ? false : undefined;

      const res = await donorsApi.searchDonors({
        bloodGroup: selectedBloodGroup || undefined,
        city: searchCity.trim() || undefined,
        availability: availabilityParam,
      });
      if (res.success && res.data) {
        setDonors(res.data);
      } else {
        setDonors([]);
      }
    } catch {
      setDonors([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBloodGroup, searchCity, availabilityFilter]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDonors();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Blood Donors</Text>
        <Text style={styles.headerSubtitle}>
          Connect directly with verified donors in your vicinity
        </Text>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBar}>
          <Icon name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by city (e.g. Ahmedabad, Surat)..."
            placeholderTextColor={Colors.textMuted}
            value={searchCity}
            onChangeText={setSearchCity}
            onSubmitEditing={fetchDonors}
            returnKeyType="search"
          />
          {searchCity.length > 0 && (
            <TouchableOpacity onPress={() => setSearchCity('')}>
              <Icon name="x-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Blood Group Filter Chips */}
      <View style={styles.bloodFilterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ label: 'All Groups', value: '' }, ...BLOOD_GROUPS]}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterScroll}
          renderItem={({ item }) => {
            const isSelected = selectedBloodGroup === item.value;
            return (
              <TouchableOpacity
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setSelectedBloodGroup(item.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Availability Filter Tabs */}
      <View style={styles.availabilityRow}>
        <View style={styles.availabilityTabs}>
          <TouchableOpacity
            style={[styles.availTab, availabilityFilter === 'ALL' && styles.availTabActive]}
            onPress={() => setAvailabilityFilter('ALL')}
            activeOpacity={0.7}
          >
            <Text style={[styles.availTabText, availabilityFilter === 'ALL' && styles.availTabTextActive]}>
              All ({donors.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.availTab, availabilityFilter === 'AVAILABLE' && styles.availTabActiveAvailable]}
            onPress={() => setAvailabilityFilter('AVAILABLE')}
            activeOpacity={0.7}
          >
            <View style={[styles.dot, { backgroundColor: Colors.normal }]} />
            <Text style={[styles.availTabText, availabilityFilter === 'AVAILABLE' && styles.availTabTextActiveAvailable]}>
              Available
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.availTab, availabilityFilter === 'UNAVAILABLE' && styles.availTabActiveUnavailable]}
            onPress={() => setAvailabilityFilter('UNAVAILABLE')}
            activeOpacity={0.7}
          >
            <View style={[styles.dot, { backgroundColor: '#DC2626' }]} />
            <Text style={[styles.availTabText, availabilityFilter === 'UNAVAILABLE' && styles.availTabTextActiveUnavailable]}>
              Unavailable
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results List */}
      <FlatList
        data={donors}
        keyExtractor={(item) => item.id || item._id || String(Math.random())}
        renderItem={({ item }) => (
          <DonorCard
            donor={item}
            onPress={() =>
              navigation.navigate(ROUTES.DONOR_DETAILS, { donorId: item.id || item._id, donor: item })
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
              icon="search"
              title="No Donors Found"
              description="Try selecting a different blood group or clearing the city search filter."
              actionTitle="Reset Filters"
              onAction={() => {
                setSelectedBloodGroup('');
                setSearchCity('');
                setAvailabilityFilter('ALL');
              }}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
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
  searchBarWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#CBD5E1',
    shadowColor: Colors.shadowAmbient,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  bloodFilterContainer: {
    backgroundColor: Colors.surface,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#CBD5E1',
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    borderTopColor: Colors.highlightTop,
    borderBottomWidth: 2.5,
    borderBottomColor: Colors.primaryDeep,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    color: Colors.textInverted,
  },
  availabilityRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  availabilityTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 14,
    padding: 3,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  availTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  availTabActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#CBD5E1',
    elevation: 2,
    shadowColor: Colors.shadowAmbient,
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  availTabActiveAvailable: {
    backgroundColor: Colors.normalBg,
    borderWidth: 1,
    borderColor: Colors.normalBorder,
    borderBottomWidth: 2,
    borderBottomColor: Colors.normalBorder,
  },
  availTabActiveUnavailable: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: Colors.emergencyBorder,
    borderBottomWidth: 2,
    borderBottomColor: Colors.emergencyBorder,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  availTabTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  availTabTextActiveAvailable: {
    color: Colors.normal,
    fontWeight: '700',
  },
  availTabTextActiveUnavailable: {
    color: '#DC2626',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
});
