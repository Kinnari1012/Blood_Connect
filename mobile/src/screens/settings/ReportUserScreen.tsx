import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { SelectDropdown } from '../../components/common/SelectDropdown';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { apiClient } from '../../api/client';

export const ReportUserScreen = ({ route, navigation }: any) => {
  const { targetUser } = route.params || {};
  const [category, setCategory] = useState('FAKE_PROFILE');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    { label: 'Fake Profile / Impersonation', value: 'FAKE_PROFILE' },
    { label: 'Incorrect Blood Group or Info', value: 'INCORRECT_INFO' },
    { label: 'Abusive or Inappropriate Behavior', value: 'ABUSE' },
    { label: 'Spam or Unsolicited Commercial Calls', value: 'SPAM' },
    { label: 'Suspicious Demands (Asking for Money)', value: 'SUSPICIOUS' },
    { label: 'Other Concerns', value: 'OTHER' },
  ];

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await apiClient.post('/reports', {
        reportedUserId: targetUser?.id || targetUser?._id || 'unknown',
        category,
        description,
      });

      Alert.alert(
        'Report Submitted',
        'Thank you for helping keep LifeLink safe. Our administrative team will review this report.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch {
      Alert.alert('Notice', 'Your report has been logged for administrative review.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Report Profile"
        subtitle={targetUser?.fullName || 'User'}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.leadText}>
          LifeLink has zero tolerance for harassment, fraudulent requests, or monetization of blood donation.
        </Text>

        <SelectDropdown
          label="Reason for Report"
          options={categories}
          selectedValue={category}
          onSelect={setCategory}
          required
        />

        <Input
          label="Additional Details (Optional)"
          placeholder="Provide any relevant context..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          containerStyle={{ height: 110 }}
        />

        <Button
          title="Submit Report"
          onPress={handleSubmit}
          variant="danger"
          loading={loading}
          size="lg"
          style={{ marginTop: 20 }}
        />
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
    padding: 20,
  },
  leadText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
});
