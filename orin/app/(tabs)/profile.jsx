import { StyleSheet, Pressable, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Spacer from '../../components/Spacer';
import { useAuth } from '../../context/AuthContext';
import { User, Settings, Bell, Award, LogOut, ChevronRight } from 'lucide-react-native';
import { Colors } from '../../constants/color';

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const menuItems = [
    { icon: Settings, label: 'Settings', onPress: () => {} },
    { icon: Bell, label: 'Notifications', onPress: () => {} },
    { icon: Award, label: 'Achievements', onPress: () => {} },
  ];

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <User size={28} color={Colors.iconColour} strokeWidth={2} />
            <ThemedText title style={styles.header}>Profile</ThemedText>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User size={40} color={Colors.iconColour} strokeWidth={1.5} />
              </View>
            </View>
            <ThemedText title style={styles.userName}>{user?.name ?? 'User'}</ThemedText>
            <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>
          </View>

          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuIconContainer}>
                  <item.icon size={20} color={Colors.iconColour} strokeWidth={1.5} />
                </View>
                <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
                <ChevronRight size={20} color={Colors.iconColour} strokeWidth={1.5} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <View style={styles.logoutIconContainer}>
              <LogOut size={20} color={Colors.iconColour} strokeWidth={1.5} />
            </View>
            <ThemedText style={styles.logoutText}>Log out</ThemedText>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: Colors.title,
  },
  profileCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.softLavender,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Poppins-Medium',
    marginBottom: 8,
    color: Colors.title,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.text,
  },
  menuContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 194, 194, 0.3)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoutText: {
    fontSize: 16,
    color: Colors.text,
    fontFamily: 'Poppins-Medium',
  },
  bottomSpacer: {
    height: 40,
  },
});
