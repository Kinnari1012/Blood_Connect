import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Icon, IconName } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

interface OnboardingSlide {
  icon: IconName;
  title: string;
  subtitle: string;
}

const slides: OnboardingSlide[] = [
  {
    icon: 'search',
    title: 'Find Verified Donors Fast',
    subtitle:
      'Search for compatible blood donors in your area instantly by blood group, city, and real-time availability.',
  },
  {
    icon: 'alert-triangle',
    title: 'Emergency Blood Alert',
    subtitle:
      'In critical medical emergencies, broadcast requests immediately to all nearby eligible donors.',
  },
  {
    icon: 'heart',
    title: 'Donate & Save Lives',
    subtitle:
      'Join our community of lifesaving heroes. Track your donation milestones, eligibility, and impact.',
  },
];

export const OnboardingScreen = ({ navigation }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { finishOnboarding } = useAuth();

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await finishOnboarding();
      navigation.replace(ROUTES.LANDING);
    }
  };

  const handleSkip = async () => {
    await finishOnboarding();
    navigation.replace(ROUTES.LANDING);
  };

  const slide = slides[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Icon name={slide.icon} size={64} color={Colors.primary} />
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>

        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                currentIndex === i ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          size="lg"
          icon="chevron-right"
          iconPosition="right"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: Colors.border,
  },
  footer: {
    padding: 24,
    paddingBottom: 36,
  },
});
