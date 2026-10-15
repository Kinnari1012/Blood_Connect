import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { Icon } from '../../components/common/Icon';
import { adminApi } from '../../api/admin.api';
import { User } from '../../types';
import { getInitials } from '../../utils/formatters';

export const UserManagementScreen = ({ navigation }: any) => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [_loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers({ search: search.trim() || undefined });
      if (res.success && res.data) {
        setUsers(res.data);
      } else {
        setUsers([]);
      }
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const handleToggleStatus = (user: User) => {
    setSelectedUser(user);
    setConfirmModalVisible(true);
  };

  const confirmToggleStatus = async () => {
    if (!selectedUser) return;
    const newStatus = selectedUser.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await adminApi.updateUserStatus(
        selectedUser.id || selectedUser._id || '',
        newStatus,
        'Administrative action via mobile app'
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, status: newStatus } : u))
      );
      setConfirmModalVisible(false);
      Alert.alert('Updated', `User status changed to ${newStatus}`);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not update user status');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="User Management"
        subtitle="Manage accounts & permissions"
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.searchBoxWrapper}>
        <View style={styles.searchBar}>
          <Icon name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or phone..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={fetchUsers}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="x-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id || item._id || String(Math.random())}
        renderItem={({ item }) => {
          const name = item.firstName
            ? `${item.firstName} ${item.lastName || ''}`
            : item.fullName || 'User';
          const isActive = item.status === 'ACTIVE';

          return (
            <Card style={styles.userCard}>
              <View style={styles.userRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(item.firstName, item.lastName)}
                  </Text>
                </View>

                <View style={styles.userTextCol}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {name}
                    </Text>
                    <StatusBadge status={item.status} />
                  </View>

                  <Text style={styles.userEmail} numberOfLines={1}>
                    {item.email}
                  </Text>
                  <Text style={styles.userPhone}>{item.phone || 'No phone'}</Text>

                  <View style={styles.roleTag}>
                    <Text style={styles.roleText}>{item.role}</Text>
                  </View>
                </View>
              </View>

              {item.role !== 'SUPER_ADMIN' && (
                <View style={styles.footerRow}>
                  <TouchableOpacity
                    style={[
                      styles.toggleStatusBtn,
                      isActive ? styles.btnDisable : styles.btnEnable,
                    ]}
                    onPress={() => handleToggleStatus(item)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name={isActive ? 'x-circle' : 'check-circle'}
                      size={15}
                      color={isActive ? Colors.emergency : Colors.normal}
                    />
                    <Text
                      style={[
                        styles.toggleStatusText,
                        isActive ? styles.textDisable : styles.textEnable,
                      ]}
                    >
                      {isActive ? 'Deactivate Account' : 'Activate Account'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          );
        }}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      />

      <ConfirmationDialog
        visible={confirmModalVisible}
        title={
          selectedUser?.status === 'ACTIVE'
            ? 'Deactivate User Account?'
            : 'Activate User Account?'
        }
        message={`Are you sure you want to change the status of ${
          selectedUser?.firstName || 'this user'
        }?`}
        confirmText={
          selectedUser?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'
        }
        confirmVariant={
          selectedUser?.status === 'ACTIVE' ? 'danger' : 'primary'
        }
        onConfirm={confirmToggleStatus}
        onCancel={() => setConfirmModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchBoxWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  userCard: {
    padding: 16,
    marginVertical: 6,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  userTextCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  userPhone: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  roleTag: {
    backgroundColor: Colors.surfaceSubtle,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  footerRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    alignItems: 'flex-end',
  },
  toggleStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  btnDisable: {
    backgroundColor: Colors.emergencyBg,
  },
  btnEnable: {
    backgroundColor: Colors.normalBg,
  },
  toggleStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textDisable: {
    color: Colors.emergency,
  },
  textEnable: {
    color: Colors.normal,
  },
});
