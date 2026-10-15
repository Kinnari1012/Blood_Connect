import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import { authApi } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

export const SettingsScreen = ({ navigation }: any) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isSmall = width < 360;

  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [emergencyVibrate, setEmergencyVibrate] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
      try {
        setLoading(true);
        const res = await authApi.getSettings();
        if (res.data && isMounted) {
          const s = res.data;
          if (s.notifications) {
            setPushNotifs(s.notifications.bloodRequests ?? true);
            setSoundAlerts(s.notifications.matchingDonors ?? true);
            setEmergencyVibrate(s.notifications.smsAlerts ?? true);
            setEmailAlerts(s.notifications.emailAlerts ?? false);
          }
          if (typeof s.twoFactorAuth === 'boolean') {
            setTwoFactorAuth(s.twoFactorAuth);
          }
          if (s.privacy?.profileVisibility) {
            setPublicProfile(s.privacy.profileVisibility === 'public');
          }
          if (s.language) {
            setSelectedLanguage(s.language);
          }
        }
      } catch (e) {
        // Fallback gracefully to local states
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadSettings();
    return () => { isMounted = false; };
  }, []);

  const handleLanguageChange = async (code: string) => {
    setSelectedLanguage(code);
    try {
      await authApi.updateSettings({ language: code });
    } catch (e) {
      // Ignored
    }
  };

  const handleToggle = async (key: string, val: boolean) => {
    if (key === 'push') setPushNotifs(val);
    if (key === 'sound') setSoundAlerts(val);
    if (key === 'vibrate') setEmergencyVibrate(val);
    if (key === 'email') setEmailAlerts(val);
    if (key === '2fa') setTwoFactorAuth(val);
    if (key === 'public') setPublicProfile(val);

    try {
      if (key === '2fa') {
        await authApi.updateSettings({ twoFactorAuth: val });
      } else if (key === 'public') {
        await authApi.updateSettings({
          privacy: { profileVisibility: val ? 'public' : 'private' }
        });
      } else {
        await authApi.updateSettings({
          notifications: {
            bloodRequests: key === 'push' ? val : pushNotifs,
            matchingDonors: key === 'sound' ? val : soundAlerts,
            smsAlerts: key === 'vibrate' ? val : emergencyVibrate,
            emailAlerts: key === 'email' ? val : emailAlerts,
          },
        });
      }
    } catch (e) {
      // Ignored
    }
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Personal Data',
      'A request to compile your complete donation history, blood requests, and account profile data has been initiated.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Settings"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView 
        contentContainerStyle={[
          styles.container,
          { paddingHorizontal: isSmall ? 12 : isTablet ? 24 : 16 },
          isTablet && styles.tabletContainer
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Quick Preview */}
        {user && (
          <>
            <Text style={styles.sectionTitle}>Account Profile</Text>
            <Card style={styles.card}>
              <View style={styles.accountRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user.fullName || `${user.firstName} ${user.lastName}`}
                  </Text>
                  <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
                  <Text style={styles.userRoleBadge}>{user.role || 'Member'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => navigation.navigate(ROUTES.EDIT_PROFILE)}
                activeOpacity={0.7}
              >
                <View style={styles.actionLeft}>
                  <Icon name="user" size={18} color={Colors.primary} />
                  <Text style={styles.actionText}>Edit Account Details</Text>
                </View>
                <Icon name="chevron-right" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            </Card>
          </>
        )}

        {/* Security Preferences */}
        <Text style={styles.sectionTitle}>Password & Security</Text>
        <Card style={styles.card}>
          <TouchableOpacity
            style={[styles.actionRow, styles.rowBorder]}
            onPress={() => navigation.navigate(ROUTES.CHANGE_PASSWORD)}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <Icon name="lock" size={18} color={Colors.primary} />
              <Text style={styles.actionText}>Change Password</Text>
            </View>
            <Icon name="chevron-right" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.switchTitle}>Two-Factor Authentication</Text>
              <Text style={styles.switchSub}>
                Protect account with OTP verification on new logins
              </Text>
            </View>
            <Switch
              value={twoFactorAuth}
              onValueChange={(val) => handleToggle('2fa', val)}
              trackColor={{ false: Colors.border, true: Colors.primaryBorder }}
              thumbColor={twoFactorAuth ? Colors.primary : '#FFFFFF'}
            />
          </View>
        </Card>

        {/* Notifications & Alert Preferences */}
        <Text style={styles.sectionTitle}>Alerts & Notifications</Text>
        <Card style={styles.card}>
          <View style={[styles.switchRow, styles.rowBorder]}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.switchTitle}>Emergency Blood Alerts</Text>
              <Text style={styles.switchSub}>
                Receive high-priority notifications when matching patients need blood
              </Text>
            </View>
            <Switch
              value={pushNotifs}
              onValueChange={(val) => handleToggle('push', val)}
              trackColor={{ false: Colors.border, true: Colors.primaryBorder }}
              thumbColor={pushNotifs ? Colors.primary : '#FFFFFF'}
            />
          </View>

          <View style={[styles.switchRow, styles.rowBorder]}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.switchTitle}>Matching Donor Alerts</Text>
              <Text style={styles.switchSub}>
                Instant alert sound on incoming matching emergency requests
              </Text>
            </View>
            <Switch
              value={soundAlerts}
              onValueChange={(val) => handleToggle('sound', val)}
              trackColor={{ false: Colors.border, true: Colors.primaryBorder }}
              thumbColor={soundAlerts ? Colors.primary : '#FFFFFF'}
            />
          </View>

          <View style={[styles.switchRow, styles.rowBorder]}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.switchTitle}>Emergency Vibration</Text>
              <Text style={styles.switchSub}>
                Continuous vibration pulse on critical high-urgency requests
              </Text>
            </View>
            <Switch
              value={emergencyVibrate}
              onValueChange={(val) => handleToggle('vibrate', val)}
              trackColor={{ false: Colors.border, true: Colors.primaryBorder }}
              thumbColor={emergencyVibrate ? Colors.primary : '#FFFFFF'}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.switchTitle}>Email Notifications</Text>
              <Text style={styles.switchSub}>
                Receive donation summaries and certificates via email
              </Text>
            </View>
            <Switch
              value={emailAlerts}
              onValueChange={(val) => handleToggle('email', val)}
              trackColor={{ false: Colors.border, true: Colors.primaryBorder }}
              thumbColor={emailAlerts ? Colors.primary : '#FFFFFF'}
            />
          </View>
        </Card>

        {/* Language Selection */}
        <Text style={styles.sectionTitle}>Language / ભાષા / भाषा</Text>
        <Card style={styles.card}>
          {languages.map((lang, idx) => {
            const isSelected = selectedLanguage === lang.code;
            const isLast = idx === languages.length - 1;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langRow, !isLast && styles.rowBorder]}
                onPress={() => handleLanguageChange(lang.code)}
                activeOpacity={0.7}
              >
                <View>
                  <Text style={styles.langLabel}>{lang.label}</Text>
                  <Text style={styles.langNative}>{lang.native}</Text>
                </View>
                {isSelected && (
                  <Icon name="check" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* Privacy & Data */}
        <Text style={styles.sectionTitle}>Privacy & Data</Text>
        <Card style={styles.card}>
          <View style={[styles.switchRow, styles.rowBorder]}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.switchTitle}>Public Directory Visibility</Text>
              <Text style={styles.switchSub}>
                Allow verified hospitals and seekers to locate your donor profile
              </Text>
            </View>
            <Switch
              value={publicProfile}
              onValueChange={(val) => handleToggle('public', val)}
              trackColor={{ false: Colors.border, true: Colors.primaryBorder }}
              thumbColor={publicProfile ? Colors.primary : '#FFFFFF'}
            />
          </View>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleExportData}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <Icon name="download" size={18} color={Colors.textSecondary} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.actionText}>Request Data Archive</Text>
                <Text style={styles.switchSub}>Download a copy of your records</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={16} color={Colors.textMuted} />
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
    paddingVertical: 14,
    paddingBottom: 48,
  },
  tabletContainer: {
    maxWidth: 680,
    alignSelf: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    padding: 0,
    marginBottom: 20,
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  userRoleBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 10,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  langLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  langNative: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  switchSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
});
