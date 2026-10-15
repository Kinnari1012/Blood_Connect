import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/common/Card';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { Icon, IconName } from '../../components/common/Icon';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

interface MenuItem {
  icon: IconName;
  title: string;
  subtitle?: string;
  route?: string;
  params?: any;
  action?: () => void;
  badge?: string;
  danger?: boolean;
}

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, isAdmin, isDonor } = useAuth();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`
    : user?.fullName || 'User Profile';

  const userBloodGroup = user?.bloodGroup || user?.donorProfile?.bloodGroup || 'O+';

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
    navigation.replace(ROUTES.LOGIN);
  };

  const accountMenu: MenuItem[] = isDonor
    ? [
        {
          icon: 'user',
          title: 'Edit Personal Profile',
          subtitle: 'Name, contact number & address',
          route: ROUTES.EDIT_PROFILE,
        },
        {
          icon: 'droplet',
          title: 'Donor Profile Settings',
          subtitle: 'Update blood group, availability & location',
          route: ROUTES.DONOR_REGISTRATION,
          badge: 'Active Donor',
        },
        {
          icon: 'heart',
          title: 'Donation History & Impact',
          subtitle: `${user?.donorProfile?.totalDonations || user?.totalDonations || 0} donations completed`,
          route: ROUTES.DONATION_HISTORY,
        },
        {
          icon: 'lock',
          title: 'Security & Password',
          subtitle: 'Change account password',
          route: ROUTES.CHANGE_PASSWORD,
        },
      ]
    : [
        {
          icon: 'user',
          title: 'Edit Personal Profile',
          subtitle: 'Name, contact number & address',
          route: ROUTES.EDIT_PROFILE,
        },
        {
          icon: 'file-text',
          title: 'My Blood Requests',
          subtitle: 'Manage and track patient blood requests',
          route: ROUTES.MY_REQUESTS,
        },
        {
          icon: 'droplet',
          title: 'Become a Blood Donor',
          subtitle: 'Join the lifesaving donor pool and save lives',
          route: ROUTES.DONOR_REGISTRATION,
          badge: 'Join Now',
        },
        {
          icon: 'lock',
          title: 'Security & Password',
          subtitle: 'Change account password',
          route: ROUTES.CHANGE_PASSWORD,
        },
      ];

  const adminMenu: MenuItem[] = isAdmin
    ? [
        {
          icon: 'shield',
          title: 'Admin Management Portal',
          subtitle: 'Manage users, requests & analytics',
          route: ROUTES.ADMIN_HOME,
          badge: 'Admin',
        },
      ]
    : [];

  const systemMenu: MenuItem[] = [
    {
      icon: 'settings',
      title: 'App Settings & Preferences',
      subtitle: 'Notifications, sound & display',
      route: ROUTES.SETTINGS,
    },
    {
      icon: 'info',
      title: 'Help & Support',
      route: ROUTES.STATIC_PAGE,
      params: { type: 'HELP' },
    },
    {
      icon: 'file-text',
      title: 'Privacy Policy',
      route: ROUTES.STATIC_PAGE,
      params: { type: 'PRIVACY' },
    },
    {
      icon: 'file-text',
      title: 'Terms of Service',
      route: ROUTES.STATIC_PAGE,
      params: { type: 'TERMS' },
    },
    {
      icon: 'log-out',
      title: 'Sign Out',
      action: () => setLogoutModalVisible(true),
      danger: true,
    },
  ];

  const renderSection = (title: string, items: MenuItem[]) => (
    <View style={styles.sectionContainer} key={title}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Card style={styles.menuCard}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <TouchableOpacity
              key={item.title}
              style={[styles.menuItem, !isLast && styles.menuItemBorder]}
              onPress={() => {
                if (item.action) {
                  item.action();
                } else if (item.route) {
                  navigation.navigate(item.route, item.params);
                }
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconCircle,
                  item.danger && { backgroundColor: Colors.emergencyBg },
                ]}
              >
                <Icon
                  name={item.icon}
                  size={18}
                  color={item.danger ? Colors.emergency : Colors.primary}
                />
              </View>

              <View style={styles.menuTextCol}>
                <Text
                  style={[styles.menuTitle, item.danger && { color: Colors.emergency }]}
                >
                  {item.title}
                </Text>
                {item.subtitle ? (
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                ) : null}
              </View>

              {item.badge ? (
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : null}

              <Icon
                name="chevron-right"
                size={18}
                color={item.danger ? Colors.emergency : Colors.textMuted}
              />
            </TouchableOpacity>
          );
        })}
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <Card variant="3d" style={styles.profileHeaderCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {getInitials(user?.firstName, user?.lastName)}
              </Text>
            </View>

            <View style={styles.profileTextCol}>
              <View style={[styles.roleTag, isDonor ? styles.roleTagDonor : styles.roleTagSeeker]}>
                <Text style={[styles.roleTagText, isDonor ? styles.roleTagDonorText : styles.roleTagSeekerText]}>
                  {isDonor ? '🩸 HERO DONOR' : '🔍 BLOOD SEEKER'}
                </Text>
              </View>
              <Text style={styles.profileName} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.profileEmail} numberOfLines={1}>
                {user?.email}
              </Text>
              <Text style={styles.profilePhone}>{user?.phone}</Text>
            </View>

            <BloodGroupBadge bloodGroup={userBloodGroup} size="lg" />
          </View>
        </Card>

        {/* Admin Menu (if applicable) */}
        {isAdmin && renderSection('Administration', adminMenu)}

        {/* Account Menu */}
        {renderSection('Account & Donation Profile', accountMenu)}

        {/* System & Support Menu */}
        {renderSection('Support & About', systemMenu)}

        <Text style={styles.versionText}>LifeLink v1.0.0 (Build 100)</Text>
      </ScrollView>

      <ConfirmationDialog
        visible={logoutModalVisible}
        title="Sign Out?"
        message="Are you sure you want to sign out of LifeLink?"
        confirmText="Sign Out"
        confirmVariant="danger"
        onConfirm={handleLogout}
        onCancel={() => setLogoutModalVisible(false)}
      />
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
    paddingBottom: 40,
  },
  profileHeaderCard: {
    padding: 18,
    marginBottom: 20,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    borderTopWidth: 2,
    borderTopColor: Colors.highlightTop,
    borderBottomWidth: 3,
    borderBottomColor: Colors.primaryDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    color: Colors.textInverted,
    fontSize: 22,
    fontWeight: '800',
  },
  profileTextCol: {
    flex: 1,
    marginRight: 10,
  },
  roleTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
  },
  roleTagDonor: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  roleTagSeeker: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  roleTagDonorText: {
    color: Colors.primary,
  },
  roleTagSeekerText: {
    color: Colors.info,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  profileEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  profilePhone: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badgePill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 10,
  },
});
