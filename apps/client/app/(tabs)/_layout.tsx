import React from 'react';
import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { COLORS } from '@brokerbox/ui';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.surface,
          paddingBottom: 4,
          height: 60,
        },
        headerStyle: {
          backgroundColor: COLORS.bg,
          borderBottomColor: COLORS.surface,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          color: COLORS.text,
          fontWeight: '700',
        },
        headerTintColor: COLORS.text,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Deal',
          tabBarIcon: ({ color }) => (
            <SymbolView name="house.fill" tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Uploads',
          tabBarIcon: ({ color }) => (
            <SymbolView name="doc.text.fill" tintColor={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
