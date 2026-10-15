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
import { DatePickerModal } from '../../components/common/DatePickerModal';
import { TimePickerModal } from '../../components/common/TimePickerModal';
import { Button } from '../../components/common/Button';
import { requestsApi } from '../../api/requests.api';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

export const CreateRequestScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O_POS');
  const [unitsRequired, setUnitsRequired] = useState('1');
  const [hospital, setHospital] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState(
    user?.donorProfile?.city || user?.city || 'Ahmedabad'
  );
  const [state, setState] = useState(
    user?.donorProfile?.state || user?.state || 'Gujarat'
  );
  const [pincode, setPincode] = useState(user?.donorProfile?.pincode || '');
  const [requiredDate, setRequiredDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [requiredTime, setRequiredTime] = useState('Immediately (Emergency)');
  const [urgency, setUrgency] = useState<'Normal' | 'Urgent' | 'Critical'>('Normal');
  const [contactName, setContactName] = useState(
    user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.fullName || ''
  );
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!patientName.trim()) {
      setError('Please provide the patient name');
      return;
    }
    if (!hospital.trim()) {
      setError('Please enter hospital name & ward');
      return;
    }
    if (!street.trim()) {
      setError('Please enter street / area address');
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
      setError('Please enter a valid 6-digit pincode');
      return;
    }
    if (!contactPhone.trim() || contactPhone.trim().length < 10) {
      setError('Please provide a valid 10-digit contact phone number');
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
        requiredDate,
        requiredTime,
        urgency,
        contactName: contactName.trim() || 'Attendant',
        contactPhone: contactPhone.trim(),
      });

      Alert.alert(
        'Blood Request Broadcasted',
        'Your request has been published and matching donors in your area will be alerted immediately.',
        [
          {
            text: 'View My Requests',
            onPress: () => navigation.navigate(ROUTES.MY_REQUESTS),
          },
        ]
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
          err?.message ||
          'Failed to create request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Create Blood Request"
        subtitle="Request blood units for patients in need"
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionHeader}>Patient & Blood Details</Text>
          <Input
            label="Patient Name"
            placeholder="e.g. Rahul Sharma"
            value={patientName}
            onChangeText={setPatientName}
            prefixIcon="user"
            required
          />

          <BloodGroupSelector
            label="Required Blood Group"
            selected={bloodGroup}
            onSelect={setBloodGroup}
            required
          />

          <SelectDropdown
            label="Units Required"
            options={[1, 2, 3, 4, 5, 6, 8, 10].map((n) => ({
              label: `${n} Unit${n > 1 ? 's' : ''}`,
              value: String(n),
            }))}
            selectedValue={unitsRequired}
            onSelect={setUnitsRequired}
            prefixIcon="droplet"
            required
          />

          <SelectDropdown
            label="Urgency Level"
            options={[
              { label: 'Normal (Standard Request)', value: 'Normal' },
              { label: 'Urgent (Required within 6 hours)', value: 'Urgent' },
              { label: 'Critical (Immediate Emergency)', value: 'Critical' },
            ]}
            selectedValue={urgency}
            onSelect={(val: any) => setUrgency(val)}
            prefixIcon="alert-triangle"
            required
          />

          <Text style={[styles.sectionHeader, { marginTop: 12 }]}>Hospital & Address</Text>
          <Input
            label="Hospital Name & Branch"
            placeholder="e.g. Civil Hospital, Asarwa"
            value={hospital}
            onChangeText={setHospital}
            prefixIcon="hospital"
            required
          />

          <Input
            label="Street / Area / Landmark"
            placeholder="e.g. Near Asarwa Road, Opp. Gate 2"
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
            placeholder="6-digit postal pincode (e.g. 380016)"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="number-pad"
            maxLength={6}
            required
          />

          <DatePickerModal
            label="Required By Date"
            value={requiredDate}
            onChange={setRequiredDate}
            required
          />

          <TimePickerModal
            label="Required Time Slot"
            value={requiredTime}
            onChange={setRequiredTime}
            required
          />

          <Text style={[styles.sectionHeader, { marginTop: 12 }]}>Contact Details</Text>
          <Input
            label="Attendant / Contact Person"
            placeholder="Full Name"
            value={contactName}
            onChangeText={setContactName}
            prefixIcon="user"
            required
          />

          <Input
            label="Contact Mobile Number"
            placeholder="10-digit mobile number"
            value={contactPhone}
            onChangeText={setContactPhone}
            prefixIcon="phone"
            keyboardType="phone-pad"
            required
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            title="Publish Blood Request"
            onPress={handleSubmit}
            loading={loading}
            size="lg"
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
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
  submitBtn: {
    marginTop: 8,
  },
});
