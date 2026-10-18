import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './src/database/database';
import { useTradeStore } from './src/store/useTradeStore';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const { loadAll, loadSettings, loadDashboard } = useTradeStore();

  useEffect(() => {
    initDatabase();
    loadSettings();
    loadDashboard(); // datos all-time para el Dashboard
    loadAll();       // datos del período activo para History/Stats
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}