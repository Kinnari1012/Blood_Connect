import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { COMPATIBILITY_MATRIX } from '../../utils/bloodCompatibility';
import { formatBloodGroup } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

export const DonorDetailsScreen = ({ route, navigation }: any) => {
  const { donor } = route.params || {};

  const donorName =
    donor?.user?.fullName ||
    (donor?.user?.firstName ? `${donor?.user?.firstName} ${donor?.user?.lastName || ''}` : 'Verified Donor');

  const phone = donor?.user?.phone || '';
  const bloodGroup = donor?.bloodGroup || 'O+';
  const displayGroup = formatBloodGroup(bloodGroup) as keyof typeof COMPATIBILITY_MATRIX;
  const compatible = COMPATIBILITY_MATRIX[displayGroup] || { canDonateTo: [] };

  const handleCall = () => {
    if (!phone) return;
    if (!donor?.availability) {
      Alert.alert(
        'Donor Temporarily Unavailable',
        'This donor has marked themselves as currently unable or unwilling to donate blood. Would you still like to call them?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call Anyway', onPress: () => Linking.openURL(`tel:${phone}`) },
        ]
      );
    } else {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleWhatsApp = () => {
    if (!phone) return;
    const clean = phone.replace(/[^0-9]/g, '');
    const sendMsg = () =>
      Linking.openURL(
        `https://wa.me/${clean}?text=Hello%20${encodeURIComponent(donorName)},%20I%20am%20contacting%20you%20via%20LifeLink.`
      );

    if (!donor?.availability) {
      Alert.alert(
        'Donor Temporarily Unavailable',
        'This donor has marked themselves as currently unable or unwilling to donate blood. Would you still like to message them?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Message Anyway', onPress: sendMsg },
        ]
      );
    } else {
      sendMsg();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Donor Profile"
        showBack
        onBack={() => navigation.goBack()}
        rightIcon="alert-circle"
        onRightPress={() => navigation.navigate(ROUTES.REPORT_USER, { targetUser: donor?.user })}
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Availability Warning Card for seekers */}
        {!donor?.availability && (
          <View style={styles.unavailableWarningCard}>
            <View style={styles.warningHeader}>
              <Icon name="alert-triangle" size={18} color="#B91C1C" />
              <Text style={styles.warningTitle}>Temporarily Unavailable to Donate</Text>
            </View>
            <Text style={styles.warningBody}>
              This donor has marked themselves as currently unable or unwilling to donate blood. Seekers are advised to contact active available donors first.
            </Text>
          </View>
        )}

        {/* Hero Profile Card */}
        <Card variant="elevated" style={styles.heroCard}>
          <BloodGroupBadge bloodGroup={bloodGroup} size="lg" style={styles.heroBadge} />
          <Text style={styles.heroName}>{donorName}</Text>
          <Text style={styles.heroLocation}>
            {[donor?.area, donor?.city, donor?.state].filter(Boolean).join(', ') || 'Ahmedabad, Gujarat'}
          </Text>

          {donor?.availability ? (
            <View style={styles.availPill}>
              <View style={styles.availDot} />
              <Text style={styles.availText}>Available to Donate</Text>
            </View>
          ) : (
            <View style={[styles.availPill, { backgroundColor: '#FEE2E2' }]}>
              <View style={[styles.availDot, { backgroundColor: '#DC2626' }]} />
              <Text style={[styles.availText, { color: '#DC2626' }]}>
                Temporarily Unavailable
              </Text>
            </View>
          )}

          {/* Contact Action Bar */}
          <View style={styles.contactBar}>
            <Button
              title="Call Donor"
              onPress={handleCall}
              icon="phone"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="WhatsApp"
              onPress={handleWhatsApp}
              variant="outline"
              icon="share"
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </Card>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <Card variant="flat" style={styles.metricCard}>
            <Icon name="droplet" size={20} color={Colors.primary} />
            <Text style={styles.metricVal}>{donor?.totalDonations || 0}</Text>
            <Text style={styles.metricLabel}>Total Donations</Text>
          </Card>

          <Card variant="flat" style={styles.metricCard}>
            <Icon name="shield" size={20} color={Colors.normal} />
            <Text style={styles.metricVal}>Verified</Text>
            <Text style={styles.metricLabel}>ID Verification</Text>
          </Card>

          <Card variant="flat" style={styles.metricCard}>
            <Icon name="phone" size={20} color={Colors.info} />
            <Text style={styles.metricVal}>{donor?.preferredContact || 'CALL'}</Text>
            <Text style={styles.metricLabel}>Preferred Contact</Text>
          </Card>
        </View>

        {/* Blood Compatibility Card */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Can Donate Blood To</Text>
          <Text style={styles.sectionDesc}>
            Compatible recipient blood groups based on medical compatibility:
          </Text>

          <View style={styles.compatGrid}>
            {compatible.canDonateTo.map((group: string) => (
              <View key={group} style={styles.compatBadge}>
                <Text style={styles.compatText}>{group}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Safety Notice */}
        <View style={styles.safetyCard}>
          <Icon name="info" size={18} color={Colors.textSecondary} />
          <Text style={styles.safetyText}>
            LifeLink facilitates voluntary, non-remunerated donation. Never pay or transfer money for blood units.
          </Text>
        </View>
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
  heroCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  heroBadge: {
    marginBottom: 14,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  heroLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  availPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.normalBg,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    marginBottom: 20,
  },
  availDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.normal,
  },
  availText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.normal,
  },
  contactBar: {
    flexDirection: 'row',
    width: '100%',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 6,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  sectionCard: {
    marginBottom: 16,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  compatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  compatBadge: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  compatText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  safetyCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 12,
    padding: 14,
    alignItems: 'flex-start',
    gap: 10,
  },
  safetyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 17,
  },
  unavailableWarningCard: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9A3412',
  },
  warningBody: {
    fontSize: 12,
    color: '#7C2D12',
    lineHeight: 18,
  },
});
