import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from './ThemeContext';
import ExpensesScreen from './screens/ExpensesScreen';
import BudgetScreen from './screens/BudgetScreen';
import RemindersScreen from './screens/RemindersScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createMaterialTopTabNavigator();

function AppNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={colors.card} 
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
              height: 65,
              paddingBottom: 5,
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
              marginTop: 4,
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
                <Ionicons 
                  name={focused ? 'wallet' : 'wallet-outline'} 
                  size={20} 
                  color={color} 
                />
              ),
            }}
          />
          <Tab.Screen 
            name="Bütçe" 
            component={BudgetScreen}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons 
                  name={focused ? 'cash' : 'cash-outline'} 
                  size={20} 
                  color={color} 
                />
              ),
            }}
          />
          <Tab.Screen 
            name="Hatırlatıcılar" 
            component={RemindersScreen}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons 
                  name={focused ? 'notifications' : 'notifications-outline'} 
                  size={20} 
                  color={color} 
                />
              ),
            }}
          />
          <Tab.Screen 
            name="Profil" 
            component={ProfileScreen}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons 
                  name={focused ? 'person' : 'person-outline'} 
                  size={20} 
                  color={color} 
                />
              ),
            }}
          />
          <Tab.Screen 
            name="Ayarlar" 
            component={SettingsScreen}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons 
                  name={focused ? 'settings' : 'settings-outline'} 
                  size={20} 
                  color={color} 
                />
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
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});