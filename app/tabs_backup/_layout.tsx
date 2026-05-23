import { Tabs, router } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore, useIsSuperAdmin } from '@store/auth.store';
import { COLORS } from '@constants/colors';

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────

function TabIcon({
  emoji,
  label,
  focused,
}: {
  emoji: string;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={[tabStyles.iconWrap, focused && tabStyles.iconActive]}>
      <Text style={tabStyles.emoji}>{emoji}</Text>
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
        {label}
      </Text>
      {focused && <View style={tabStyles.activeDot} />}
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuthStore();
  const isSuperAdmin = useIsSuperAdmin();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FEFDF8',
          borderTopWidth: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          shadowColor: '#3D0C11',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 16,
          // Gold top border
          borderTopColor: COLORS.gold[300],
          borderTopWidth: 1.5,
        },
        tabBarActiveTintColor: COLORS.maroon[800],
        tabBarInactiveTintColor: COLORS.sandal[400],
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="villages"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏘️" label="Villages" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔍" label="Search" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    gap: 2,
    position: 'relative',
  },
  iconActive: {},
  emoji: {
    fontSize: 22,
  },
  label: {
    fontSize: 10,
    color: COLORS.sandal[400],
    fontWeight: '500',
  },
  labelActive: {
    color: COLORS.maroon[800],
    fontWeight: '700',
  },
  activeDot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gold[500],
  },
});
