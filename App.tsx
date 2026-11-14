import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AppThemeProvider } from './src/theme';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AppThemeProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
