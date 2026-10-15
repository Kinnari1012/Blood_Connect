import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon, IconName } from '../../components/common/Icon';
import { notificationsApi } from '../../api/notifications.api';
import { NotificationItem } from '../../types';
import { formatDate } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

export const NotificationsScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationsApi.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
    } catch {
      // Ignore
    }
  };

  const handleItemPress = async (item: NotificationItem) => {
    const isUnread = !(item.isRead ?? item.read);
    if (isUnread) {
      try {
        await notificationsApi.markRead(item.id || item._id || '');
        setNotifications((prev) =>
          prev.map((n) =>
            (n.id && n.id === item.id) || (n._id && n._id === item._id)
              ? { ...n, isRead: true, read: true }
              : n
          )
        );
      } catch {
        // Ignore
      }
    }

    const reqId =
      item.relatedRequestId ||
      item.data?.requestId ||
      item.data?.request?.id ||
      item.data?.request?._id;
    if (reqId) {
      navigation.navigate(ROUTES.REQUEST_DETAILS, { requestId: reqId });
    }
  };

  const getNotificationIcon = (type: string): { icon: IconName; color: string; bg: string } => {
    const t = (type || '').toUpperCase();
    if (t.includes('EMERGENCY') || t.includes('CRITICAL')) {
      return { icon: 'alert-triangle', color: Colors.emergency, bg: Colors.emergencyBg };
    }
    if (t.includes('ACCEPTED') || t.includes('MATCHED')) {
      return { icon: 'heart', color: Colors.normal, bg: Colors.normalBg };
    }
    if (t.includes('COMPLETED') || t.includes('FULFILLED')) {
      return { icon: 'check-circle', color: Colors.normal, bg: Colors.normalBg };
    }
    if (t.includes('APPROVED')) {
      return { icon: 'shield', color: Colors.info, bg: Colors.infoBg };
    }
    if (t.includes('CANCEL')) {
      return { icon: 'x-circle', color: Colors.emergency, bg: Colors.emergencyBg };
    }
    return { icon: 'droplet', color: Colors.primary, bg: Colors.primaryLight };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Notifications"
        showBack
        onBack={() => navigation.goBack()}
        rightIcon="check"
        onRightPress={handleMarkAllRead}
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id || item._id || String(Math.random())}
        renderItem={({ item }) => {
          const styleConfig = getNotificationIcon(item.type);
          const isRead = !!(item.isRead ?? item.read);
          const textContent = item.body || item.description || '';
          const hasLinkedRequest = !!(
            item.relatedRequestId ||
            item.data?.requestId ||
            item.data?.request?.id ||
            item.data?.request?._id
          );

          return (
            <Card
              onPress={() => handleItemPress(item)}
              style={isRead ? styles.cardRead : styles.cardUnread}
            >
              <View style={styles.row}>
                <View style={[styles.iconWrapper, { backgroundColor: styleConfig.bg }]}>
                  <Icon name={styleConfig.icon} size={20} color={styleConfig.color} />
                </View>

                <View style={styles.textCol}>
                  <View style={styles.topRow}>
                    <Text style={styles.title} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {!isRead && <View style={styles.unreadDot} />}
                  </View>

                  {textContent ? <Text style={styles.body}>{textContent}</Text> : null}

                  <View style={styles.bottomRow}>
                    <Text style={styles.time}>{formatDate(item.createdAt)}</Text>
                    {hasLinkedRequest && (
                      <View style={styles.viewBadge}>
                        <Text style={styles.viewBadgeText}>View Request</Text>
                        <Icon name="chevron-right" size={12} color={Colors.primary} />
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </Card>
          );
        }}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="bell"
              title="No Notifications"
              description="You have caught up with all blood donation alerts and updates."
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
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  cardUnread: {
    padding: 14,
    marginVertical: 5,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  cardRead: {
    padding: 14,
    marginVertical: 5,
    opacity: 0.85,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: 6,
  },
  body: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  viewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
});
