import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@constants/colors';
import i18n from '@services/i18n.service';
import { useLanguageStore } from '@store/language.store';

// ─── Custom Floating Pill Tab Bar ──────────────────────────────────────────

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const locale = useLanguageStore((s) => s.locale); // dynamic listener

  return (
    <View style={[
      styles.tabBarContainer,
      { 
        height: 60 + insets.bottom,
        paddingBottom: insets.bottom,
        paddingTop: 6
      }
    ]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        // Define emojis and labels based on route name
        let emoji = '🏠';
        let label = i18n.t('tab_home');
        
        switch (route.name) {
          case 'index':
            emoji = '🏠';
            label = i18n.t('tab_home');
            break;
          case 'villages':
            emoji = '🏘️';
            label = i18n.t('tab_villages');
            break;
          case 'search':
            emoji = '🔍';
            label = i18n.t('tab_search');
            break;
          case 'profile':
            emoji = '👤';
            label = i18n.t('tab_profile');
            break;
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[
              styles.tabItem,
              isFocused ? styles.tabItemActive : styles.tabItemInactive
            ]}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabEmoji, isFocused && styles.tabEmojiActive]}>
              {emoji}
            </Text>
            <Text style={[styles.tabLabel, isFocused ? styles.tabLabelActive : styles.tabLabelInactive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="villages" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FEFDF8', // Solid Gold cream background spanning 100% width
    borderTopWidth: 1.5,
    borderTopColor: COLORS.gold[200],
    // Shadows
    shadowColor: '#3D0C11',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  tabItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 2,
  },
  tabItemActive: {
    backgroundColor: '#6B1414', // Premium Deep Maroon Pill Container
    borderWidth: 1,
    borderColor: COLORS.gold[400] + '40', // 25% opacity gold border
  },
  tabItemInactive: {
    backgroundColor: 'transparent',
  },
  tabEmoji: {
    fontSize: 20,
    opacity: 0.6,
  },
  tabEmojiActive: {
    fontSize: 18,
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: '#FEFDF8', // Crisp white on maroon active
  },
  tabLabelInactive: {
    color: COLORS.sandal[500],
  },
});
