import React, { useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../constants';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import NewTradeScreen from '../screens/NewTradeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  Dashboard: {
    active: 'grid',
    inactive: 'grid-outline',
  },
  NewTrade: {
    active: 'add-circle',
    inactive: 'add-circle-outline',
  },
  History: {
    active: 'list',
    inactive: 'list-outline',
  },
  Stats: {
    active: 'bar-chart',
    inactive: 'bar-chart-outline',
  },
  Settings: {
    active: 'settings',
    inactive: 'settings-outline',
  },
};

const FadeScreen = ({ children }: { children: React.ReactNode }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
      {children}
    </Animated.View>
  );
};

// Componentes definidos como constantes estáticas FUERA del render
// para evitar que React Navigation los desmonte/monte en cada render
const DashboardFade = () => <FadeScreen><DashboardScreen /></FadeScreen>;
const NewTradeFade = () => <FadeScreen><NewTradeScreen /></FadeScreen>;
const HistoryFade = () => <FadeScreen><HistoryScreen /></FadeScreen>;
const StatsFade = () => <FadeScreen><StatsScreen /></FadeScreen>;
const SettingsFade = () => <FadeScreen><SettingsScreen /></FadeScreen>;

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 2,
          },
          tabBarIcon: ({ focused, color }) => {
            const icons = TAB_ICONS[route.name];
            const iconName = focused ? icons.active : icons.inactive;
            return <Ionicons name={iconName} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardFade}
          options={{ tabBarLabel: 'Inicio' }}
        />
        <Tab.Screen
          name="NewTrade"
          component={NewTradeFade}
          options={{ tabBarLabel: 'Registrar' }}
        />
        <Tab.Screen
          name="History"
          component={HistoryFade}
          options={{ tabBarLabel: 'Historial' }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsFade}
          options={{ tabBarLabel: 'Estadísticas' }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsFade}
          options={{ tabBarLabel: 'Config' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}