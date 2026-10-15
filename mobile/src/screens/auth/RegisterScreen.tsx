import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { BloodGroupSelector } from '../../components/common/BloodGroupSelector';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

export const RegisterScreen = ({ navigation }: any) => {
  const { register } = useAuth();
  const [role, setRole] = useState<'DONOR' | 'USER'>('DONOR');
  const [bloodGroup, setBloodGroup] = useState('O_POS');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please provide your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setError('Please provide a valid 10-digit mobile number');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role,
        bloodGroup: role === 'DONOR' ? bloodGroup : undefined,
      });
      navigation.replace(ROUTES.MAIN_TABS);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Icon name="droplet" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Join LifeLink</Text>
            <Text style={styles.subtitle}>
              Register as a lifesaving donor or blood seeker
            </Text>
          </View>

          {/* Account Role Selector: DONOR vs USER */}
          <Text style={styles.roleSectionLabel}>SELECT ACCOUNT TYPE</Text>
          <View style={styles.roleSelectionRow}>
            {/* Donor Option */}
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => setRole('DONOR')}
              style={[
                styles.roleCard,
                role === 'DONOR' ? styles.roleCardActiveDonor : styles.roleCardInactive,
              ]}
            >
              <View
                style={[
                  styles.roleIconCircle,
                  role === 'DONOR'
                    ? { backgroundColor: Colors.primary }
                    : { backgroundColor: Colors.surfaceSubtle },
                ]}
              >
                <Icon
                  name="droplet"
                  size={20}
                  color={role === 'DONOR' ? Colors.textInverted : Colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.roleCardTitle,
                  role === 'DONOR' && { color: Colors.primary },
                ]}
              >
                Blood Donor
              </Text>
              <Text style={styles.roleCardSub}>
                Donate blood & get alerts
              </Text>
              {role === 'DONOR' && (
                <View style={styles.roleCheckBadge}>
                  <Icon name="check" size={10} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* Recipient / User Option */}
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => setRole('USER')}
              style={[
                styles.roleCard,
                role === 'USER' ? styles.roleCardActiveUser : styles.roleCardInactive,
              ]}
            >
              <View
                style={[
                  styles.roleIconCircle,
                  role === 'USER'
                    ? { backgroundColor: Colors.info }
                    : { backgroundColor: Colors.surfaceSubtle },
                ]}
              >
                <Icon
                  name="user"
                  size={20}
                  color={role === 'USER' ? Colors.textInverted : Colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.roleCardTitle,
                  role === 'USER' && { color: Colors.info },
                ]}
              >
                General User
              </Text>
              <Text style={styles.roleCardSub}>
                Find donors & request blood
              </Text>
              {role === 'USER' && (
                <View style={[styles.roleCheckBadge, { backgroundColor: Colors.info }]}>
                  <Icon name="check" size={10} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Blood Group Selection for Donors */}
          {role === 'DONOR' && (
            <View style={styles.donorBloodGroupSection}>
              <BloodGroupSelector
                label="Your Blood Group"
                selected={bloodGroup}
                onSelect={setBloodGroup}
                required
              />
            </View>
          )}

          {error ? (
            <View style={styles.errorBanner}>
              <Icon name="alert-circle" size={18} color={Colors.emergency} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.nameRow}>
            <Input
              label="First Name"
              placeholder="John"
              value={firstName}
              onChangeText={setFirstName}
              required
              containerStyle={{ flex: 1, marginRight: 8 }}
            />
            <Input
              label="Last Name"
              placeholder="Doe"
              value={lastName}
              onChangeText={setLastName}
              required
              containerStyle={{ flex: 1, marginLeft: 8 }}
            />
          </View>

          <Input
            label="Email Address"
            placeholder="john.doe@example.com"
            value={email}
            onChangeText={setEmail}
            prefixIcon="mail"
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />

          <Input
            label="Phone Number"
            placeholder="+91 9876543210"
            value={phone}
            onChangeText={setPhone}
            prefixIcon="phone"
            keyboardType="phone-pad"
            required
          />

          <Input
            label="Password"
            placeholder="Minimum 8 characters"
            value={password}
            onChangeText={setPassword}
            prefixIcon="lock"
            isPassword
            required
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            prefixIcon="lock"
            isPassword
            required
          />

          <Button
            title={role === 'DONOR' ? 'Register as Blood Donor' : 'Register as User'}
            onPress={handleRegister}
            loading={loading}
            size="lg"
            style={styles.registerBtn}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.LOGIN)}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  roleSectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 2,
  },
  roleSelectionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  roleCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    position: 'relative',
  },
  roleCardInactive: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
  },
  roleCardActiveDonor: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderTopColor: Colors.highlightTop,
    borderBottomWidth: 3,
    borderBottomColor: Colors.primaryDeep,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  roleCardActiveUser: {
    backgroundColor: Colors.infoBg,
    borderWidth: 1.5,
    borderColor: Colors.info,
    borderTopColor: Colors.highlightTop,
    borderBottomWidth: 3,
    borderBottomColor: Colors.infoDeep,
    shadowColor: Colors.info,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  roleIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  roleCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  roleCardSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  roleCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donorBloodGroupSection: {
    marginBottom: 6,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.emergencyBg,
    borderWidth: 1,
    borderColor: Colors.emergencyBorder,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorBannerText: {
    fontSize: 13,
    color: Colors.emergency,
    flex: 1,
    fontWeight: '600',
  },
  nameRow: {
    flexDirection: 'row',
  },
  registerBtn: {
    marginTop: 8,
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});
