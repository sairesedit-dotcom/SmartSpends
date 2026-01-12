import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import GestureRecognizer from 'react-native-swipe-gestures';
import ExpensesScreen from './screens/ExpensesScreen';
import BudgetScreen from './screens/BudgetScreen';
import RemindersScreen from './screens/RemindersScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

export default function App() {
  const [currentTab, setCurrentTab] = useState(0);

  const tabs = ['Harcamalar', 'Bütçe', 'Hatırlatıcılar', 'Profil'];

  const onSwipeLeft = () => {
    if (currentTab < tabs.length - 1) {
      setCurrentTab(currentTab + 1);
    }
  };

  const onSwipeRight = () => {
    if (currentTab > 0) {
      setCurrentTab(currentTab - 1);
    }
  };

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <GestureRecognizer
        onSwipeLeft={onSwipeLeft}
        onSwipeRight={onSwipeRight}
        config={config}
        style={{ flex: 1 }}
      >
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Harcamalar') {
                  iconName = focused ? 'wallet' : 'wallet-outline';
                } else if (route.name === 'Bütçe') {
                  iconName = focused ? 'cash' : 'cash-outline';
                } else if (route.name === 'Hatırlatıcılar') {
                  iconName = focused ? 'notifications' : 'notifications-outline';
                } else if (route.name === 'Profil') {
                  iconName = focused ? 'person' : 'person-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#6C5CE7',
              tabBarInactiveTintColor: '#999',
              headerShown: false,
              tabBarStyle: {
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                elevation: 8,
                backgroundColor: '#fff',
                borderTopWidth: 1,
                borderTopColor: '#F0F0F0',
                height: 70,
                paddingBottom: 10,
                paddingTop: 10,
              },
              tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '600',
                marginBottom: 5,
              },
            })}
          >
            <Tab.Screen name="Harcamalar" component={ExpensesScreen} />
            <Tab.Screen name="Bütçe" component={BudgetScreen} />
            <Tab.Screen name="Hatırlatıcılar" component={RemindersScreen} />
            <Tab.Screen name="Profil" component={ProfileScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </GestureRecognizer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});