import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
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
      {/* Üst Safe Area: Saat ve pil kısmını kart rengine boyar */}
      <View style={{ height: insets.top, backgroundColor: colors.card }}>
        <StatusBar 
          barStyle={isDark ? "light-content" : "dark-content"} 
          backgroundColor={colors.card} 
          translucent
        />
      </View>

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
              // Alt bar yüksekliği ve çentikli telefon desteği
              height: 60 + insets.bottom, 
              paddingBottom: insets.bottom > 0 ? insets.bottom - 5 : 5, 
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: '600',
              marginTop: 0,
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
      
      {/* Alt Safe Area: Navigasyon çubuğunun altındaki boşluğu doldurur */}
      <View style={{ height: insets.bottom, backgroundColor: colors.card }} />
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