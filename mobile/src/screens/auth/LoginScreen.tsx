import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

type AuthMethod = 'PASSWORD' | 'OTP';

export const LoginScreen = ({ navigation }: any) => {
  const { login, sendOtp } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('PASSWORD');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Donor availability setting during login
  const [markUnavailable, setMarkUnavailable] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Timer for OTP resend countdown
  useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleSendOtp = async () => {
    setError(null);
    setInfoMessage(null);
    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('Please enter your email address or mobile number first');
      return;
    }

    try {
      setSendingOtp(true);
      const res = await sendOtp(cleanId);
      setOtpSent(true);
      setResendTimer(30);
      setInfoMessage(res.message || 'Verification OTP sent successfully');
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
      }
    } catch (err: any) {
      setError(err?.message || 'Could not send OTP. Please check your credentials.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleLogin = async () => {
    setError(null);
    setInfoMessage(null);
    const cleanId = identifier.trim();

    if (!cleanId) {
      setError('Please enter your registered email address or mobile number');
      return;
    }

    if (authMethod === 'PASSWORD') {
      if (!password) {
        setError('Please enter your password');
        return;
      }
    } else {
      if (!otp.trim()) {
        setError('Please enter the 6-digit OTP code');
        return;
      }
    }

    try {
      setLoading(true);
      const secret = authMethod === 'PASSWORD' ? password : otp.trim();
      const isOtp = authMethod === 'OTP';
      // Pass desired donor availability: false if markUnavailable is checked
      const donorAvailability = !markUnavailable;

      await login(cleanId, secret, isOtp, donorAvailability);
      navigation.replace(ROUTES.MAIN_TABS);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isEmail = identifier.includes('@');

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
          {/* Logo & Welcome Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Icon name="droplet" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.welcomeTitle}>Welcome to LifeLink</Text>
            <Text style={styles.subtitle}>
              Sign in with your email or mobile number using password or OTP
            </Text>
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBanner}>
              <Icon name="alert-circle" size={18} color={Colors.emergency} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          {/* Info Banner */}
          {infoMessage ? (
            <View style={styles.infoBanner}>
              <Icon name="check-circle" size={18} color={Colors.normal} />
              <Text style={styles.infoBannerText}>{infoMessage}</Text>
            </View>
          ) : null}

          {/* Auth Method Selector Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, authMethod === 'PASSWORD' && styles.tabBtnActive]}
              onPress={() => {
                setAuthMethod('PASSWORD');
                setError(null);
              }}
              activeOpacity={0.75}
            >
              <Icon
                name="lock"
                size={16}
                color={authMethod === 'PASSWORD' ? Colors.primary : Colors.textMuted}
              />
              <Text
                style={[
                  styles.tabText,
                  authMethod === 'PASSWORD' && styles.tabTextActive,
                ]}
              >
                Password Login
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, authMethod === 'OTP' && styles.tabBtnActive]}
              onPress={() => {
                setAuthMethod('OTP');
                setError(null);
              }}
              activeOpacity={0.75}
            >
              <Icon
                name="phone"
                size={16}
                color={authMethod === 'OTP' ? Colors.primary : Colors.textMuted}
              />
              <Text
                style={[
                  styles.tabText,
                  authMethod === 'OTP' && styles.tabTextActive,
                ]}
              >
                OTP Verification
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Form */}
          <View style={styles.form}>
            <Input
              label="Email Address or Mobile Number"
              placeholder="e.g. user@example.com or 9876543210"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                if (error) setError(null);
                setDevOtpHint(null);
              }}
              prefixIcon={isEmail ? 'mail' : 'phone'}
              keyboardType={isEmail ? 'email-address' : 'default'}
              autoCapitalize="none"
              required
            />

            {authMethod === 'PASSWORD' ? (
              <>
                <Input
                  label="Password"
                  placeholder="Enter your account password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) setError(null);
                  }}
                  prefixIcon="lock"
                  isPassword
                  required
                />

                <View style={styles.forgotRow}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.otpSection}>
                {!otpSent ? (
                  <View style={styles.sendOtpBox}>
                    <Text style={styles.sendOtpDesc}>
                      We will send a one-time 6-digit verification code to your registered email or mobile number.
                    </Text>
                    <Button
                      title="Request OTP Code"
                      onPress={handleSendOtp}
                      loading={sendingOtp}
                      icon="mail"
                      size="md"
                      variant="outline"
                      style={styles.sendOtpBtn}
                    />
                  </View>
                ) : (
                  <>
                    <Input
                      label="6-Digit OTP Code"
                      placeholder="Enter verification code"
                      value={otp}
                      onChangeText={(text) => {
                        setOtp(text);
                        if (error) setError(null);
                      }}
                      prefixIcon="shield"
                      keyboardType="number-pad"
                      maxLength={6}
                      required
                    />

                    {devOtpHint ? (
                      <View style={styles.devOtpBadge}>
                        <Icon name="info" size={14} color={Colors.info} />
                        <Text style={styles.devOtpText}>
                          Dev Testing Code: <Text style={styles.devOtpCode}>{devOtpHint}</Text>
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.resendRow}>
                      {resendTimer > 0 ? (
                        <Text style={styles.resendTimerText}>
                          Resend code in {resendTimer}s
                        </Text>
                      ) : (
                        <TouchableOpacity
                          onPress={handleSendOtp}
                          disabled={sendingOtp}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.resendLink}>
                            {sendingOtp ? 'Sending...' : 'Didn’t get code? Resend OTP'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                )}
              </View>
            )}

            {/* Donor Availability Status Option */}
            <View style={styles.donorOptionCard}>
              <View style={styles.donorOptionHeader}>
                <View style={styles.donorOptionIconWrapper}>
                  <Icon name="heart" size={18} color={markUnavailable ? Colors.emergency : Colors.normal} />
                </View>
                <View style={styles.donorOptionTextCol}>
                  <Text style={styles.donorOptionTitle}>Donor Availability Status</Text>
                  <Text style={styles.donorOptionSub}>
                    Option for eligible blood donors
                  </Text>
                </View>
                <Switch
                  value={markUnavailable}
                  onValueChange={setMarkUnavailable}
                  trackColor={{ false: Colors.normalBg, true: '#FEE2E2' }}
                  thumbColor={markUnavailable ? Colors.emergency : Colors.normal}
                />
              </View>

              <View style={styles.statusBadgeRow}>
                <View
                  style={[
                    styles.statusBadge,
                    markUnavailable ? styles.statusBadgeUnavailable : styles.statusBadgeAvailable,
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: markUnavailable ? Colors.emergency : Colors.normal },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: markUnavailable ? Colors.emergency : Colors.normal },
                    ]}
                  >
                    {markUnavailable ? 'Mark as Temporarily Unavailable' : 'Status: Available to Donate'}
                  </Text>
                </View>
              </View>

              <Text style={styles.donorOptionExplanation}>
                {markUnavailable
                  ? '⚠️ You will be marked as temporarily unavailable upon login. Other users will clearly see you are unable to donate at this time.'
                  : '✓ You are active and ready to donate. Seekers can contact you for matching blood requests.'}
              </Text>
            </View>

            {/* Submit Action */}
            <Button
              title={
                authMethod === 'OTP' && !otpSent
                  ? 'Send OTP to Sign In'
                  : 'Sign In to Account'
              }
              onPress={authMethod === 'OTP' && !otpSent ? handleSendOtp : handleLogin}
              loading={loading || sendingOtp}
              size="lg"
              style={styles.loginBtn}
              icon={authMethod === 'OTP' && !otpSent ? 'mail' : undefined}
            />
          </View>

          {/* Register Callout */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.REGISTER)}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLink}> Create Account</Text>
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
    paddingBottom: 28,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 320,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.normalBg,
    borderWidth: 1,
    borderColor: Colors.normalBorder,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  infoBannerText: {
    fontSize: 13,
    color: Colors.normal,
    flex: 1,
    fontWeight: '600',
  },
  form: {
    marginBottom: 20,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: 16,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  otpSection: {
    marginBottom: 8,
  },
  sendOtpBox: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  sendOtpDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  sendOtpBtn: {
    borderColor: Colors.primary,
  },
  devOtpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
    marginBottom: 12,
  },
  devOtpText: {
    fontSize: 12,
    color: Colors.info,
    fontWeight: '500',
  },
  devOtpCode: {
    fontWeight: '700',
    color: Colors.info,
    letterSpacing: 1.5,
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resendTimerText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  resendLink: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
  },
  donorOptionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 20,
    marginTop: 4,
  },
  donorOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  donorOptionIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  donorOptionTextCol: {
    flex: 1,
    marginRight: 8,
  },
  donorOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  donorOptionSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  statusBadgeRow: {
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  statusBadgeAvailable: {
    backgroundColor: Colors.normalBg,
  },
  statusBadgeUnavailable: {
    backgroundColor: Colors.emergencyBg,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  donorOptionExplanation: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  loginBtn: {
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});
