import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { ROUTES } from '../../constants/routes';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <Icon
            name={submitted ? 'check-circle' : 'lock'}
            size={40}
            color={submitted ? Colors.normal : Colors.primary}
          />
        </View>

        <Text style={styles.title}>
          {submitted ? 'Check Your Email' : 'Reset Password'}
        </Text>
        <Text style={styles.subtitle}>
          {submitted
            ? `We have sent password reset instructions to ${email}. Please check your inbox.`
            : 'Enter your registered email address to receive password recovery instructions.'}
        </Text>

        {!submitted ? (
          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="Enter your registered email"
              value={email}
              onChangeText={setEmail}
              prefixIcon="mail"
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />

            <Button
              title="Send Instructions"
              onPress={handleSubmit}
              loading={loading}
              size="lg"
            />
          </View>
        ) : (
          <Button
            title="Back to Sign In"
            onPress={() => navigation.navigate(ROUTES.LOGIN)}
            size="lg"
            style={{ width: '100%', marginTop: 20 }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  container: {
    padding: 24,
    alignItems: 'center',
    flexGrow: 1,
  },
  backBtn: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
    marginBottom: 28,
  },
  form: {
    width: '100%',
  },
});
