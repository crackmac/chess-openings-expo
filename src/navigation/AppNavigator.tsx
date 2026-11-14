/**
 * App Navigation Setup
 * Main navigation structure for the app
 */

import React from 'react';
import { NavigationContainer, DarkTheme, Theme as NavigationTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { OpeningBrowserScreen } from '../screens/OpeningBrowserScreen';
import { OpeningDetailScreen } from '../screens/OpeningDetailScreen';
import { GameScreen } from '../screens/GameScreen';
import { BoardTestScreen } from '../screens/BoardTestScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { Opening } from '../types';
import { useAppTheme } from '../theme';

export type RootStackParamList = {
  MainTabs: undefined;
  OpeningDetail: { opening: Opening };
  Game: { opening: Opening; userColor: 'white' | 'black' };
  BoardTest: undefined;
};

export type MainTabParamList = {
  Browse: undefined;
  Progress: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  const { theme } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accentGold,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.bgSecondary,
          borderTopWidth: 1,
          borderTopColor: theme.colors.borderSubtle,
          height: 62,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          paddingBottom: 4,
        },
        tabBarIcon: ({ color, size }) => {
          const iconName: Record<keyof MainTabParamList, React.ComponentProps<typeof Ionicons>['name']> = {
            Browse: 'book-outline',
            Progress: 'stats-chart-outline',
            Settings: 'settings-outline',
          };

          return <Ionicons name={iconName[route.name as keyof MainTabParamList]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Browse"
        component={OpeningBrowserScreen}
        options={{ tabBarLabel: 'Openings' }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ tabBarLabel: 'Progress' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { theme } = useAppTheme();

  const navigationTheme: NavigationTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: theme.colors.accentGold,
      background: theme.colors.bgPrimary,
      card: theme.colors.bgSecondary,
      text: theme.colors.textPrimary,
      border: theme.colors.borderSubtle,
      notification: theme.colors.accentGold,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.bgSecondary,
          },
          headerTintColor: theme.colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '700',
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OpeningDetail"
          component={OpeningDetailScreen}
          options={{
            title: 'Opening Details',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={({ route }) => ({
            title: route.params.opening.name,
            headerBackTitle: 'Back',
          })}
        />
        <Stack.Screen
          name="BoardTest"
          component={BoardTestScreen}
          options={{ title: 'Board Test' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
