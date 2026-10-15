import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { LandingScreen } from '../screens/public/LandingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { DonorDetailsScreen } from '../screens/donors/DonorDetailsScreen';
import { DonorRegistrationScreen } from '../screens/donors/DonorRegistrationScreen';
import { FindDonorsScreen } from '../screens/donors/FindDonorsScreen';
import { CreateRequestScreen } from '../screens/requests/CreateRequestScreen';
import { EmergencyRequestScreen } from '../screens/requests/EmergencyRequestScreen';
import { RequestDetailsScreen } from '../screens/requests/RequestDetailsScreen';
import { MyRequestsScreen } from '../screens/requests/MyRequestsScreen';
import { DonationHistoryScreen } from '../screens/donations/DonationHistoryScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/profile/ChangePasswordScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { StaticPageScreen } from '../screens/settings/StaticPageScreen';
import { ReportUserScreen } from '../screens/settings/ReportUserScreen';
import { UserHomeScreen } from '../screens/home/UserHomeScreen';
import { DonorHomeScreen } from '../screens/home/DonorHomeScreen';
import { DonorRequestsScreen } from '../screens/donors/DonorRequestsScreen';
import { AdminHomeScreen } from '../screens/admin/AdminHomeScreen';
import { UserManagementScreen } from '../screens/admin/UserManagementScreen';
import { ROUTES } from '../constants/routes';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.SPLASH}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Auth & Public Stack */}
      <Stack.Screen name={ROUTES.SPLASH} component={SplashScreen} />
      <Stack.Screen name={ROUTES.LANDING} component={LandingScreen} />
      <Stack.Screen name={ROUTES.ONBOARDING} component={OnboardingScreen} />
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
      <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPasswordScreen} />

      {/* Main App (Tabs) */}
      <Stack.Screen name={ROUTES.MAIN_TABS} component={MainTabNavigator} />

      {/* Inner Screens & Modals */}
      <Stack.Screen name={ROUTES.FIND_DONORS} component={FindDonorsScreen} />
      <Stack.Screen name={ROUTES.MY_REQUESTS} component={MyRequestsScreen} />
      <Stack.Screen name={ROUTES.DONOR_DETAILS} component={DonorDetailsScreen} />
      <Stack.Screen name={ROUTES.DONOR_REGISTRATION} component={DonorRegistrationScreen} />
      <Stack.Screen name={ROUTES.CREATE_REQUEST} component={CreateRequestScreen} />
      <Stack.Screen name={ROUTES.EMERGENCY_REQUEST} component={EmergencyRequestScreen} />
      <Stack.Screen name={ROUTES.REQUEST_DETAILS} component={RequestDetailsScreen} />
      <Stack.Screen name={ROUTES.DONATION_HISTORY} component={DonationHistoryScreen} />
      <Stack.Screen name={ROUTES.NOTIFICATIONS} component={NotificationsScreen} />
      <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
      <Stack.Screen name={ROUTES.EDIT_PROFILE} component={EditProfileScreen} />
      <Stack.Screen name={ROUTES.CHANGE_PASSWORD} component={ChangePasswordScreen} />
      <Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
      <Stack.Screen name={ROUTES.STATIC_PAGE} component={StaticPageScreen} />
      <Stack.Screen name={ROUTES.REPORT_USER} component={ReportUserScreen} />
      <Stack.Screen name={ROUTES.USER_HOME} component={UserHomeScreen} />
      <Stack.Screen name={ROUTES.DONOR_HOME} component={DonorHomeScreen} />
      <Stack.Screen name={ROUTES.INCOMING_REQUESTS} component={DonorRequestsScreen} />

      {/* Admin Management Screens */}
      <Stack.Screen name={ROUTES.ADMIN_HOME} component={AdminHomeScreen} />
      <Stack.Screen name={ROUTES.USER_MANAGEMENT} component={UserManagementScreen} />
    </Stack.Navigator>
  );
};
