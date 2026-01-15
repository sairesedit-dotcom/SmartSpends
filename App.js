import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './ThemeContext';
import ExpensesScreen from './screens/ExpensesScreen';
import BudgetScreen from './screens/BudgetScreen';
import RemindersScreen from './screens/RemindersScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createMaterialTopTabNavigator();

function AppNavigator() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={colors.card} 
        translucent={false}
      />

      <NavigationContainer>
        <Tab.Navigator
          tabBarPosition="bottom"
          screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textSecondary,
            tabBarStyle: {
              backgroundColor: colors.card,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              height: 60,
              paddingBottom: Platform.OS === 'android' ? 5 : insets.bottom,
              paddingTop: 5,
              elevation: 0,
              position: 'relative',
            },
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: '600',
              marginTop: 2,
              textTransform: 'none',
            },
            tabBarIndicatorStyle: {
              backgroundColor: colors.primary,
              height: 3,
              top: 0,
            },
            tabBarShowIcon: true,
            swipeEnabled: true,
            tabBarPressColor: colors.light,
            animationEnabled: true,
          }}
        >
          <Tab.Screen 
            name="Harcamalar" 
            component={ExpensesScreen}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={22} color={color} />
              ),
            }}
          />
          <Tab.Screen 
            name="Bütçe" 
            component={BudgetScreen}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'cash' : 'cash-outline'} size={22} color={color} />
              ),
            }}
          />
          <Tab.Screen 
            name="Hatırlatıcı" 
            component={RemindersScreen}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={22} color={color} />
              ),
            }}
          />
          <Tab.Screen 
            name="Profil" 
            component={ProfileScreen}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
              ),
            }}
          />
          <Tab.Screen 
            name="Ayarlar" 
            component={SettingsScreen}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'settings' : 'settings-outline'} size={22} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});