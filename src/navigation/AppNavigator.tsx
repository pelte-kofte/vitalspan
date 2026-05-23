import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from '../screens/DashboardScreen';
import LongevityScoreScreen from '../screens/LongevityScoreScreen';
import BiomarkerDetailScreen from '../screens/BiomarkerDetailScreen';
import BiomarkerEntryScreen from '../screens/BiomarkerEntryScreen';
import InteractionCheckerScreen from '../screens/InteractionCheckerScreen';
import LabUploadScreen from '../screens/LabUploadScreen';
import ProtocolScreen from '../screens/ProtocolScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LandingScreen from '../screens/LandingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';

import { Colors } from '../theme';

export type RootStackParamList = {
  Landing: undefined;
  Onboarding: undefined;
  Main: undefined;
  BiomarkerDetail: { biomarkerId: string };
  BiomarkerEntry: { biomarkerId?: string };
  InteractionChecker: undefined;
  LabUpload: undefined;
  LongevityScore: undefined;
  Settings: undefined;
  About: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, color: focused ? Colors.primary : Colors.textMuted }}>
      {emoji}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bg,
          borderTopColor: Colors.border,
          borderTopWidth: 0.5,
          paddingBottom: 8,
          paddingTop: 8,
          height: 72,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Biomarkers"
        component={BiomarkerDetailScreen}
        options={{
          tabBarLabel: 'Biomarkers',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Protocol"
        component={ProtocolScreen}
        options={{
          tabBarLabel: 'Protocol',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🧬" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

interface Props {
  initialRoute: 'Landing' | 'Main';
}

export default function AppNavigator({ initialRoute }: Props) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="Landing"
          component={LandingScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ gestureEnabled: false }}
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
          name="LabUpload"
          component={LabUploadScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="LongevityScore"
          component={LongevityScoreScreen}
          options={{ presentation: 'card', animation: 'fade_from_bottom' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
