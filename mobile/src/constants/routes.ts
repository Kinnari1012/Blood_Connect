export const ROUTES = {
  // Public & Auth Stack
  SPLASH: 'Splash',
  LANDING: 'Landing',
  ONBOARDING: 'Onboarding',
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',

  // Main Tabs
  MAIN_TABS: 'MainTabs',
  TAB_HOME: 'TabHome',
  TAB_DONORS: 'TabDonors',
  TAB_REQUEST_ACTION: 'TabRequestAction',
  TAB_MY_REQUESTS: 'TabMyRequests',
  TAB_DONATE: 'TabDonate',
  TAB_HISTORY: 'TabHistory',
  TAB_PROFILE: 'TabProfile',

  // Inner Stack Screens
  USER_HOME: 'UserHome',
  DONOR_HOME: 'DonorHome',
  ADMIN_HOME: 'AdminHome',
  FIND_DONORS: 'FindDonors',
  DONOR_DETAILS: 'DonorDetails',
  DONOR_REGISTRATION: 'DonorRegistration',
  
  CREATE_REQUEST: 'CreateRequest',
  EMERGENCY_REQUEST: 'EmergencyRequest',
  MY_REQUESTS: 'MyRequests',
  INCOMING_REQUESTS: 'IncomingRequests',
  REQUEST_DETAILS: 'RequestDetails',
  
  DONATION_HISTORY: 'DonationHistory',
  NOTIFICATIONS: 'Notifications',
  
  PROFILE: 'Profile',
  EDIT_PROFILE: 'EditProfile',
  CHANGE_PASSWORD: 'ChangePassword',
  SETTINGS: 'Settings',
  STATIC_PAGE: 'StaticPage',
  REPORT_USER: 'ReportUser',

  // Admin Screens
  USER_MANAGEMENT: 'UserManagement',
  REQUEST_MANAGEMENT: 'RequestManagement',
  ANALYTICS_OVERVIEW: 'AnalyticsOverview',
} as const;
