import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { BloodGroupSelector } from '../../components/common/BloodGroupSelector';
import { Input } from '../../components/common/Input';
import { SelectDropdown } from '../../components/common/SelectDropdown';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { requestsApi } from '../../api/requests.api';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

export const EmergencyRequestScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O_POS');
  const [unitsRequired, setUnitsRequired] = useState('2');
  const [hospital, setHospital] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState(
    user?.donorProfile?.city || user?.city || 'Ahmedabad'
  );
  const [state, setState] = useState(
    user?.donorProfile?.state || user?.state || 'Gujarat'
  );
  const [pincode, setPincode] = useState(user?.donorProfile?.pincode || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBroadcast = async () => {
    setError(null);
    if (!patientName.trim()) {
      setError('Please provide patient name');
      return;
    }
    if (!hospital.trim()) {
      setError('Please specify hospital name');
      return;
    }
    if (!street.trim()) {
      setError('Please enter street or area');
      return;
    }
    if (!city.trim()) {
      setError('Please enter city');
      return;
    }
    if (!state.trim()) {
      setError('Please enter state');
      return;
    }
    if (!pincode.trim() || pincode.trim().length < 6) {
      setError('Please provide a valid 6-digit pincode');
      return;
    }
    if (!contactPhone.trim()) {
      setError('Please provide emergency contact number');
      return;
    }

    try {
      setLoading(true);
      const fullLocation = [
        street.trim(),
        city.trim(),
        state.trim(),
        pincode.trim() ? `${pincode.trim()}` : '',
      ]
        .filter(Boolean)
        .join(', ');

      await requestsApi.createRequest({
        patientName: patientName.trim(),
        bloodGroup,
        unitsRequired: parseInt(unitsRequired, 10) || 1,
        hospital: hospital.trim(),
        location: fullLocation,
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        requiredDate: new Date().toISOString().split('T')[0],
        requiredTime: 'Immediately (Emergency)',
        urgency: 'Critical',
        contactName: user?.fullName || patientName.trim(),
        contactPhone: contactPhone.trim(),
      });

      Alert.alert(
        '🚨 Emergency Broadcast Sent!',
        'Emergency alert has been sent to matching donors in your city. You will receive responses shortly.',
        [
          {
            text: 'Track Request',
            onPress: () => navigation.navigate(ROUTES.MY_REQUESTS),
          },
        ]
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
          err?.message ||
          'Failed to broadcast emergency alert'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Emergency Request"
        subtitle="Critical Blood Requirement Broadcast"
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Emergency Alert Banner */}
          <View style={styles.warningBox}>
            <Icon name="alert-triangle" size={24} color={Colors.emergency} />
            <View style={styles.warningTextCol}>
              <Text style={styles.warningTitle}>CRITICAL EMERGENCY</Text>
              <Text style={styles.warningDesc}>
                This broadcast will immediately notify all matching available donors within your area. Please use only for urgent medical situations.
              </Text>
            </View>
          </View>

          <BloodGroupSelector
            label="Required Blood Group"
            selected={bloodGroup}
            onSelect={setBloodGroup}
            required
          />

          <View style={styles.row}>
            <Input
              label="Patient Name"
              placeholder="Full name"
              value={patientName}
              onChangeText={setPatientName}
              required
              containerStyle={{ flex: 1, marginRight: 8 }}
            />
            <SelectDropdown
              label="Units"
              options={[1, 2, 3, 4, 5, 8].map((n) => ({
                label: `${n} Unit${n > 1 ? 's' : ''}`,
                value: String(n),
              }))}
              selectedValue={unitsRequired}
              onSelect={setUnitsRequired}
              containerStyle={{ width: 110 }}
              required
            />
          </View>

          <Input
            label="Hospital & ICU/Ward Number"
            placeholder="e.g. Sterling Hospital, Emergency Ward"
            value={hospital}
            onChangeText={setHospital}
            prefixIcon="hospital"
            required
          />

          <Input
            label="Street / Area / Landmark"
            placeholder="e.g. Near Gurukul Road, Opp. Drive-In"
            value={street}
            onChangeText={setStreet}
            prefixIcon="map-pin"
            required
          />

          <View style={styles.formRow}>
            <Input
              label="City"
              placeholder="e.g. Ahmedabad"
              value={city}
              onChangeText={setCity}
              required
              containerStyle={styles.halfInput}
            />
            <Input
              label="State"
              placeholder="e.g. Gujarat"
              value={state}
              onChangeText={setState}
              required
              containerStyle={styles.halfInput}
            />
          </View>

          <Input
            label="Pincode"
            placeholder="6-digit postal pincode (e.g. 380052)"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="number-pad"
            maxLength={6}
            required
          />

          <Input
            label="Emergency Contact Phone"
            placeholder="Direct mobile number"
            value={contactPhone}
            onChangeText={setContactPhone}
            prefixIcon="phone"
            keyboardType="phone-pad"
            required
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            title="Broadcast Emergency Alert"
            onPress={handleBroadcast}
            variant="danger"
            size="lg"
            icon="alert-triangle"
            loading={loading}
            style={styles.broadcastBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8F8',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: Colors.emergencyBorder,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  warningTextCol: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.emergency,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  warningDesc: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 17,
  },
  row: {
    flexDirection: 'row',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  errorText: {
    color: Colors.emergency,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  broadcastBtn: {
    marginTop: 10,
  },
});
