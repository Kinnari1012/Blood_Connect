import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';

export const StaticPageScreen = ({ route, navigation }: any) => {
  const { type = 'HELP' } = route.params || {};

  const getPageContent = () => {
    switch (type) {
      case 'PRIVACY':
        return {
          title: 'Privacy Policy',
          subtitle: 'How we protect and use your data',
          sections: [
            {
              heading: '1. Information We Collect',
              body: 'We collect your name, mobile phone number, blood group, and city location strictly for matching and facilitating voluntary blood donations.',
            },
            {
              heading: '2. Donor Contact Privacy',
              body: 'Your phone number is only shared with verified seekers when you have marked your status as Available or agreed to an emergency request.',
            },
            {
              heading: '3. Data Security',
              body: 'All communications and credentials are encrypted using industry-standard protocols. We never sell or monetize user data.',
            },
          ],
        };
      case 'TERMS':
        return {
          title: 'Terms of Service',
          subtitle: 'Rules and guidelines for LifeLink users',
          sections: [
            {
              heading: '1. Voluntary Donation',
              body: 'LifeLink strictly facilitates non-commercial voluntary blood donation. Buying or selling blood is illegal and prohibited.',
            },
            {
              heading: '2. User Integrity',
              body: 'Users must provide truthful health and blood group information. Fraudulent requests will result in account termination.',
            },
            {
              heading: '3. Medical Discretion',
              body: 'All blood donation and transfusion procedures must take place in licensed hospitals or certified blood banks under authorized supervision.',
            },
          ],
        };
      case 'HELP':
      default:
        return {
          title: 'Help & Support',
          subtitle: 'Frequently asked questions & assistance',
          sections: [
            {
              heading: 'How do I request emergency blood?',
              body: 'Tap the red "Emergency Request" button on the home screen or navigation bar. Fill in the hospital and patient details to broadcast an alert to nearby donors immediately.',
            },
            {
              heading: 'How do I toggle my donor availability?',
              body: 'On the Home screen or in your Profile, toggle the "Donor Availability" switch. When toggled off, seekers cannot contact you.',
            },
            {
              heading: 'Need immediate emergency assistance?',
              body: 'Email support@lifelink.org or call our 24/7 community hotline at 1800-LIFE-LINK.',
            },
          ],
        };
    }
  };

  const content = getPageContent();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={content.title}
        subtitle={content.subtitle}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {content.sections.map((sec, i) => (
          <Card key={i} style={styles.card}>
            <Text style={styles.heading}>{sec.heading}</Text>
            <Text style={styles.body}>{sec.body}</Text>
          </Card>
        ))}

        <View style={styles.supportBox}>
          <Icon name="mail" size={18} color={Colors.primary} />
          <Text style={styles.supportText}>
            Questions? Contact <Text style={{ fontWeight: '700' }}>support@lifelink.org</Text>
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
    paddingBottom: 40,
  },
  card: {
    padding: 18,
    marginBottom: 14,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  supportBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  supportText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
