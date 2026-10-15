import React, { useState } from 'react';
import {
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
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { donorsApi } from '../../api/donors.api';
import { CITIES } from '../../constants/bloodGroups';

export const DonorRegistrationScreen = ({ navigation }: any) => {
  const { user, refreshUser } = useAuth();
  const existing = user?.donorProfile;

  const [bloodGroup, setBloodGroup] = useState(existing?.bloodGroup || user?.bloodGroup || 'O_POS');
  const [gender, setGender] = useState('MALE');
  const [dob, setDob] = useState('2000-01-01');
  const [city, setCity] = useState(existing?.city || user?.city || 'Ahmedabad');
  const [area, setArea] = useState(existing?.area || '');
  const [pincode, setPincode] = useState('');
  const [contactMode, setContactMode] = useState('CALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!bloodGroup) {
      setError('Please select your blood group');
      return;
    }
    if (!city) {
      setError('Please select or enter your city');
      return;
    }

    try {
      setLoading(true);
      if (existing) {
        await donorsApi.updateProfile({
          bloodGroup,
          city,
          area,
          pincode,
          preferredContact: contactMode,
        });
      } else {
        await donorsApi.createProfile({
          bloodGroup,
          dateOfBirth: dob,
          gender,
          preferredContact: contactMode,
          city,
          area,
          pincode,
        });
      }
      await refreshUser();
      Alert.alert(
        'Success',
        'Your donor profile has been updated successfully! You are now eligible to save lives.',
        [{ text: 'Great', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to update donor profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={existing ? 'Edit Donor Profile' : 'Become a Donor'}
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionHeader}>Blood Group & Eligibility</Text>
          <BloodGroupSelector
            selected={bloodGroup}
            onSelect={setBloodGroup}
            required
          />

          <DatePickerModal
            label="Date of Birth"
            value={dob}
            onChange={setDob}
            required
          />

          <SelectDropdown
            label="Gender"
            options={[
              { label: 'Male', value: 'MALE' },
              { label: 'Female', value: 'FEMALE' },
              { label: 'Other', value: 'OTHER' },
            ]}
            selectedValue={gender}
            onSelect={setGender}
            required
          />

          <Text style={[styles.sectionHeader, { marginTop: 12 }]}>Location & Contact</Text>
          <SelectDropdown
            label="City"
            options={CITIES.map((c) => ({ label: c, value: c }))}
            selectedValue={city}
            onSelect={setCity}
            prefixIcon="map-pin"
            required
          />

          <Input
            label="Area / Locality"
            placeholder="e.g. Navrangpura, SG Highway"
            value={area}
            onChangeText={setArea}
            prefixIcon="map-pin"
          />

          <Input
            label="Pincode"
            placeholder="e.g. 380009"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="numeric"
          />

          <SelectDropdown
            label="Preferred Contact Mode"
            options={[
              { label: 'Phone Call', value: 'CALL', subtitle: 'Receive direct calls for urgent requests' },
              { label: 'WhatsApp', value: 'WHATSAPP', subtitle: 'Receive messages via WhatsApp' },
              { label: 'In-App Notification', value: 'IN_APP', subtitle: 'Only get alerts within the app' },
            ]}
            selectedValue={contactMode}
            onSelect={setContactMode}
            prefixIcon="phone"
            required
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            title={existing ? 'Save Changes' : 'Register as Donor'}
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
  errorText: {
    color: Colors.emergency,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: 12,
  },
});
