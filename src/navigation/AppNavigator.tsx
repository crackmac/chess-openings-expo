/**
 * App Navigation Setup
 * Main navigation structure for the app
 */

import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { OpeningBrowserScreen } from '../screens/OpeningBrowserScreen';
import { OpeningDetailScreen } from '../screens/OpeningDetailScreen';
import { GameScreen } from '../screens/GameScreen';
import { BoardTestScreen } from '../screens/BoardTestScreen';
import { Opening } from '../types';

export type RootStackParamList = {
  MainTabs: undefined;
  OpeningDetail: { opening: Opening };
  Game: { opening: Opening; userColor: 'white' | 'black' };
  BoardTest: undefined;
};

export type MainTabParamList = {
  Browse: undefined;
  Progress: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder Progress Screen (to be implemented later)
const ProgressScreen = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Browse" component={OpeningBrowserScreen} />
    </Tab.Navigator>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2196f3',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
      }}
    >
      <Tab.Screen
        name="Browse"
        component={OpeningBrowserScreen}
        options={{
          tabBarLabel: 'Browse',
          tabBarIcon: () => null, // You can add icons here later
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: () => null, // You can add icons here later
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#333',
          headerTitleStyle: {
            fontWeight: 'bold',
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
            headerBackTitle: 'Back'
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

