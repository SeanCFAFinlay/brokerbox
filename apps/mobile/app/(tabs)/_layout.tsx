import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

const COLORS = {
  bg: '#0B0F14',
  card: '#121822',
  surface: '#161D29',
  primary: '#14B8A6',
  text: '#E5E7EB',
  muted: '#6B7280',
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  // Using simple text emoji or SVG placeholder for now to guarantee compilation
  return (
    <View style={{ opacity: focused ? 1 : 0.5, alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>{name}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.bg, borderBottomWidth: 1, borderBottomColor: COLORS.surface },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '600', fontFamily: 'System' },
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopWidth: 1,
          borderTopColor: COLORS.surface,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon name="📊" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="pipeline"
        options={{
          title: 'Pipeline',
          tabBarIcon: ({ focused }) => <TabIcon name="💼" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ focused }) => <TabIcon name="👥" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="lenders"
        options={{
          title: 'Lenders',
          tabBarIcon: ({ focused }) => <TabIcon name="🏦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calculators"
        options={{
          title: 'Calculators',
          tabBarIcon: ({ focused }) => <TabIcon name="🧮" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
