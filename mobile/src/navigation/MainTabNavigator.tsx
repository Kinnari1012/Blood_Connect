import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { UserHomeScreen } from '../screens/home/UserHomeScreen';
import { DonorHomeScreen } from '../screens/home/DonorHomeScreen';
import { FindDonorsScreen } from '../screens/donors/FindDonorsScreen';
import { DonorRequestsScreen } from '../screens/donors/DonorRequestsScreen';
import { MyRequestsScreen } from '../screens/requests/MyRequestsScreen';
import { DonationHistoryScreen } from '../screens/donations/DonationHistoryScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EmergencyRequestScreen } from '../screens/requests/EmergencyRequestScreen';
import { Icon } from '../components/common/Icon';
import { Colors } from '../constants/colors';
import { ROUTES } from '../constants/routes';

const Tab = createBottomTabNavigator();

function CustomEmergencyButton({ onPress }: any) {
  return (
    <TouchableOpacity
      style={styles.emergencyFab}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.emergencyFabOuter}>
        <View style={styles.emergencyFabInner}>
          <Icon name="alert-triangle" size={24} color={Colors.textInverted} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const HomeIcon = ({ color }: { color: string }) => <Icon name="heart" size={22} color={color} />;
const DonorsIcon = ({ color }: { color: string }) => <Icon name="search" size={22} color={color} />;
const RequestsIcon = ({ color }: { color: string }) => <Icon name="file-text" size={22} color={color} />;
const DonateIcon = ({ color }: { color: string }) => <Icon name="droplet" size={22} color={color} />;
const HistoryIcon = ({ color }: { color: string }) => <Icon name="calendar" size={22} color={color} />;
const ProfileIcon = ({ color }: { color: string }) => <Icon name="user" size={22} color={color} />;

export const MainTabNavigator = () => {
  const { isDonor } = useAuth();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 10);
  const tabBarHeight = 58 + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: bottomInset,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {isDonor ? (
        // ------------------ DONOR TAB EXPERIENCE ------------------
        <>
          <Tab.Screen
            name={ROUTES.TAB_HOME}
            component={DonorHomeScreen}
            options={{
              tabBarLabel: 'Home',
              tabBarIcon: HomeIcon,
            }}
          />

          <Tab.Screen
            name={ROUTES.TAB_DONATE}
            component={DonorRequestsScreen}
            options={{
              tabBarLabel: 'Donate',
              tabBarIcon: DonateIcon,
            }}
          />

          <Tab.Screen
            name={ROUTES.TAB_HISTORY}
            component={DonationHistoryScreen}
            options={{
              tabBarLabel: 'History',
              tabBarIcon: HistoryIcon,
            }}
          />

          <Tab.Screen
            name={ROUTES.TAB_PROFILE}
            component={ProfileScreen}
            options={{
              tabBarLabel: 'Profile',
              tabBarIcon: ProfileIcon,
            }}
          />
        </>
      ) : (
        // ------------------ SEEKER (USER) TAB EXPERIENCE ------------------
        <>
          <Tab.Screen
            name={ROUTES.TAB_HOME}
            component={UserHomeScreen}
            options={{
              tabBarLabel: 'Home',
              tabBarIcon: HomeIcon,
            }}
          />

          <Tab.Screen
            name={ROUTES.TAB_DONORS}
            component={FindDonorsScreen}
            options={{
              tabBarLabel: 'Donors',
              tabBarIcon: DonorsIcon,
            }}
          />

          <Tab.Screen
            name={ROUTES.TAB_REQUEST_ACTION}
            component={EmergencyRequestScreen}
            options={{
              tabBarLabel: '',
              tabBarButton: CustomEmergencyButton,
            }}
          />

          <Tab.Screen
            name={ROUTES.TAB_MY_REQUESTS}
            component={MyRequestsScreen}
            options={{
              tabBarLabel: 'Requests',
              tabBarIcon: RequestsIcon,
            }}
          />

          <Tab.Screen
            name={ROUTES.TAB_PROFILE}
            component={ProfileScreen}
            options={{
              tabBarLabel: 'Profile',
              tabBarIcon: ProfileIcon,
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1.5,
    borderTopColor: '#FFFFFF',
    paddingTop: 6,
    elevation: 10,
    shadowColor: Colors.shadowAmbient,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: Colors.borderLight,
    borderRightColor: Colors.borderLight,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  emergencyFab: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyFabOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.emergency,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  emergencyFabInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.emergency,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: Colors.highlightTop,
    borderBottomWidth: 3,
    borderBottomColor: Colors.emergencyDeep,
  },
});
