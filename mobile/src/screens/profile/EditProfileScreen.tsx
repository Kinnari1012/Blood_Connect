import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { SelectDropdown } from '../../components/common/SelectDropdown';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { CITIES } from '../../constants/bloodGroups';

export const EditProfileScreen = ({ navigation }: any) => {
  const { user, updateUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || 'Ahmedabad');
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'First and last name are required');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (user) {
        updateUser({
          ...user,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          fullName: `${firstName.trim()} ${lastName.trim()}`,
          phone: phone.trim(),
          city,
          address,
        });
      }
      Alert.alert('Saved', 'Your profile details have been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Edit Profile"
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.nameRow}>
            <Input
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              required
              containerStyle={{ flex: 1, marginRight: 8 }}
            />
            <Input
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              required
              containerStyle={{ flex: 1, marginLeft: 8 }}
            />
          </View>

          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            prefixIcon="phone"
            keyboardType="phone-pad"
            required
          />

          <SelectDropdown
            label="City"
            options={CITIES.map((c) => ({ label: c, value: c }))}
            selectedValue={city}
            onSelect={setCity}
            prefixIcon="map-pin"
            required
          />

          <Input
            label="Address"
            placeholder="Street address / apartment"
            value={address}
            onChangeText={setAddress}
            prefixIcon="map-pin"
          />

          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={loading}
            size="lg"
            style={styles.saveBtn}
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
  },
  nameRow: {
    flexDirection: 'row',
  },
  saveBtn: {
    marginTop: 16,
  },
});
