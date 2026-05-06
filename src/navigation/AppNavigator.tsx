import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from '../screens/DashboardScreen';
import BiomarkerDetailScreen from '../screens/BiomarkerDetailScreen';
import BiomarkerEntryScreen from '../screens/BiomarkerEntryScreen';
import InteractionCheckerScreen from '../screens/InteractionCheckerScreen';
import ProtocolScreen from '../screens/ProtocolScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LandingScreen from '../screens/LandingScreen';

import { Colors } from '../theme';

export type RootStackParamList = {
  Landing: undefined;
  Onboarding: undefined;
  Main: undefined;
  BiomarkerDetail: { biomarkerId: string };
  BiomarkerEntry: { biomarkerId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const color = focused ? Colors.primary : Colors.textMuted;
  const icons: Record<string, string> = {
    Home: '⊙',
    Biomarkers: '◈',
    Protocol: '⊕',
    Profile: '◉',
  };
  return (
    <React.Fragment>
      {/* Replace with proper SVG icons in production */}
    </React.Fragment>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bgCard,
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
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Biomarkers"
        component={BiomarkerDetailScreen}
        options={{ tabBarLabel: 'Biomarkers' }}
      />
      <Tab.Screen
        name="Protocol"
        component={ProtocolScreen}
        options={{ tabBarLabel: 'Protocol' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
