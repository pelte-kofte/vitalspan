import React from 'react';
import { NavigationContainer, NavigatorScreenParams } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from '../screens/DashboardScreen';
import TodayHomeScreen from '../screens/TodayHomeScreen';
import HealthScreen from '../screens/HealthScreen';
import HealthSystemScreen from '../screens/HealthSystemScreen';
import ExerciseScreen from '../screens/ExerciseScreen';
import LongevityScoreScreen from '../screens/LongevityScoreScreen';
import BiomarkerDetailScreen from '../screens/BiomarkerDetailScreen';
import BiomarkerEntryScreen from '../screens/BiomarkerEntryScreen';
import InteractionCheckerScreen from '../screens/InteractionCheckerScreen';
import LabUploadScreen from '../screens/LabUploadScreen';
import AddResultScreen from '../screens/AddResultScreen';
import ProtocolScreen from '../screens/ProtocolScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import GuidedFirstRunScreen from '../screens/GuidedFirstRunScreen';
import ArticlesScreen from '../screens/ArticlesScreen';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';
import ExerciseDetailScreen from '../screens/ExerciseDetailScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import SignUpConfirmationScreen from '../screens/SignUpConfirmationScreen';
import AIAdvisorScreen from '../screens/AIAdvisorScreen';
import PaywallScreen from '../screens/PaywallScreen';
import type { BodySystemId } from '../lib/healthExperience';

import { Colors } from '../theme';
import { HomeIcon, HealthIcon, ProtocolIcon, ExerciseIcon, ProfileIcon } from '../components/TabIcons';

export type RootStackParamList = {
  Welcome: undefined;
  SignUpConfirmation: { email: string };
  ForgotPassword: { email?: string };
  Onboarding: undefined;
  // NavigatorScreenParams lets a root-level screen (e.g. Settings) jump straight
  // to a specific tab: nav.navigate('Main', { screen: 'Profile' }).
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  BiomarkerDetail: { biomarkerId?: string };
  HealthSystem: { systemId: BodySystemId };
  BiomarkerEntry: { biomarkerId?: string; entryId?: string };
  InteractionChecker: undefined;
  LabUpload: undefined;
  AddResult: undefined;
  LongevityScore: undefined;
  GuidedFirstRun: undefined;
  Settings: undefined;
  About: undefined;
  Articles: { issueNumber?: number } | undefined;
  ArticleDetail: { pmid: string };
  ExerciseDetail: { exerciseId: string };
  Paywall: undefined;
  AIAdvisor: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Biomarkers: undefined;
  Protocol: undefined;
  Exercise: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

export const ACTIVE_HOME_EXPERIENCE = 'today' as
  | 'today'
  | 'legacy-dashboard';

function MainTabs() {
  const insets = useSafeAreaInsets();
  const legacyDashboardIsActive =
    ACTIVE_HOME_EXPERIENCE === 'legacy-dashboard';
  const ActiveHomeScreen = legacyDashboardIsActive
    ? DashboardScreen
    : TodayHomeScreen;
  return (
    <Tab.Navigator
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.dark.bg,
          borderTopColor: Colors.dark.cardBorder,
          borderTopWidth: 0.5,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          height: Math.max(insets.bottom, 0) + 56,
        },
        tabBarActiveTintColor: Colors.dark.ctaPrimary,
        tabBarInactiveTintColor: Colors.dark.textMuted,
        tabBarAllowFontScaling: false,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
          letterSpacing: 0.3,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={ActiveHomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => <HomeIcon color={color} focused={focused} />,
          ...(!legacyDashboardIsActive ? {
            tabBarActiveTintColor: Colors.health.accent,
            tabBarInactiveTintColor: Colors.health.inkTertiary,
            tabBarStyle: {
              backgroundColor: Colors.health.background,
              borderTopColor: Colors.health.rule,
              borderTopWidth: 1,
              paddingBottom: Math.max(insets.bottom, 8),
              paddingTop: 8,
              height: Math.max(insets.bottom, 0) + 56,
            },
          } : {}),
        }}
      />
      <Tab.Screen
        name="Biomarkers"
        component={HealthScreen}
        options={{
          tabBarLabel: 'Health',
          tabBarIcon: ({ color, focused }) => <HealthIcon color={color} focused={focused} />,
          tabBarActiveTintColor: Colors.health.accent,
          tabBarInactiveTintColor: Colors.health.inkTertiary,
          tabBarStyle: {
            backgroundColor: Colors.health.background,
            borderTopColor: Colors.health.rule,
            borderTopWidth: 1,
            paddingBottom: Math.max(insets.bottom, 8),
            paddingTop: 8,
            height: Math.max(insets.bottom, 0) + 56,
          },
        }}
      />
      <Tab.Screen
        name="Protocol"
        component={ProtocolScreen}
        options={{
          tabBarLabel: 'Protocol',
          tabBarIcon: ({ color, focused }) => <ProtocolIcon color={color} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Exercise"
        component={ExerciseScreen}
        options={{
          tabBarLabel: 'Exercise',
          tabBarIcon: ({ color, focused }) => <ExerciseIcon color={color} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => <ProfileIcon color={color} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

interface Props {
  initialRoute: 'Welcome' | 'Onboarding' | 'Main';
}

export default function AppNavigator({ initialRoute }: Props) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="SignUpConfirmation"
          component={SignUpConfirmationScreen}
          options={{ presentation: 'modal', gestureEnabled: false }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="HealthSystem"
          component={HealthSystemScreen}
          // Health is intentionally motion-light. Avoid a dark transition frame on
          // compact devices and respect Reduce Motion without custom animation code.
          options={{ presentation: 'card', animation: 'none' }}
        />
        <Stack.Screen
          name="BiomarkerDetail"
          component={BiomarkerDetailScreen}
          options={{ presentation: 'card' }}
        />
        <Stack.Screen
          name="BiomarkerEntry"
          component={BiomarkerEntryScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="InteractionChecker"
          component={InteractionCheckerScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="AddResult"
          component={AddResultScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="LabUpload"
          component={LabUploadScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="LongevityScore"
          component={LongevityScoreScreen}
          options={{ presentation: 'fullScreenModal', animation: 'fade_from_bottom' }}
        />
        <Stack.Screen
          name="GuidedFirstRun"
          component={GuidedFirstRunScreen}
          options={{ presentation: 'fullScreenModal', animation: 'fade_from_bottom', gestureEnabled: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            // 'modal' (pageSheet) puts an interactive-dismiss pan gesture over
            // the whole sheet, which on iOS steals taps in the top band of the
            // content (right under the grab handle) instead of passing them to
            // rows there — e.g. "Edit profile" — while rows further down are
            // unaffected. SettingsScreen already has its own header with an
            // explicit "Done" button, so 'card' (edge-swipe-back only) avoids
            // the whole-content dismiss gesture without losing a close affordance.
            presentation: 'card',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="Articles"
          component={ArticlesScreen}
          options={{ presentation: 'card', animation: 'fade' }}
        />
        <Stack.Screen
          name="ArticleDetail"
          component={ArticleDetailScreen}
          options={{ presentation: 'card', animation: 'fade_from_bottom' }}
        />
        <Stack.Screen
          name="ExerciseDetail"
          component={ExerciseDetailScreen}
          options={{ presentation: 'card' }}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ presentation: 'fullScreenModal', animation: 'fade_from_bottom' }}
        />
        <Stack.Screen
          name="AIAdvisor"
          component={AIAdvisorScreen}
          options={{ presentation: 'fullScreenModal', animation: 'fade_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
