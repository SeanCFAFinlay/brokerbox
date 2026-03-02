import { Tabs } from 'expo-router';
import { COLORS } from '@brokerbox/ui';

export default function BrokerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.surface,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="pipeline"
        options={{
          title: 'Pipeline',
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
        }}
      />
      <Tabs.Screen
        name="lenders"
        options={{
          title: 'Lenders',
        }}
      />
      <Tabs.Screen
        name="calculators"
        options={{
          title: 'Calc',
        }}
      />
    </Tabs>
  );
}
