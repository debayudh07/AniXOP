import { Text, View, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { defiConcepts } from '../services/gemini';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.2:3000';

interface UserStats {
  totalTimeSpent: number;
  totalConceptsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  totalConcepts: number;
}

interface LessonProgress {
  conceptId: string;
  status: string;
  progress: number;
  lastOpenedAt: string;
  completedAt?: string;
}

interface CourseData {
  title: string;
  progress: number;
  status: string;
  conceptId: string;
}

interface AchievementData {
  title: string;
  description: string;
  icon: string;
  earned: boolean;
}

export default function Profile() {
  const router = useRouter();
  const { user, token, loading: authLoading, logout, updateProfile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [userStats, setUserStats] = useState<UserStats>({
    totalTimeSpent: 0,
    totalConceptsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalConcepts: 0,
  });
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize edit fields when user changes
  useEffect(() => {
    if (user) {
      setEditUsername(user.username || '');
      setEditEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      const [statsResponse, progressResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/learning/stats`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${API_BASE_URL}/api/defi/concepts/status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (statsResponse.ok) {
        const data = await statsResponse.json();
        if (data.success && data.data) {
          setUserStats(data.data);
        }
      }

      if (progressResponse.ok) {
        const data = await progressResponse.json();
        if (data.success && data.data) {
          // Map lesson progress to courses
          const conceptMap: Record<string, string> = {
            'defi': 'Introduction to DeFi',
            'amm': 'Automated Market Makers (AMM)',
            'lppools': 'Liquidity Pools & LP Tokens',
            'snipping': 'Token Sniping',
            'yield-farming': 'Yield Farming Strategies',
            'impermanent-loss': 'Impermanent Loss Explained',
            'smart-contracts': 'Smart Contract Basics',
            'front-running': 'Front-Running & MEV',
            'gas-fees': 'Understanding Gas Fees',
            'defi-protocols': 'Major DeFi Protocols',
            'rugpulls': 'Identifying Rug Pulls',
            'slashing': 'Slashing (Validator Penalties)',
          };

          const coursesData: CourseData[] = data.data.map((item: any) => ({
            conceptId: item.conceptId,
            title: conceptMap[item.conceptId] || item.conceptId,
            progress: item.progress || 0,
            status: item.status === 'completed' ? 'Completed' : item.status === 'in_progress' ? 'In Progress' : 'Not Started'
          }));

          setCourses(coursesData);

          // Calculate achievements
          const completedCount = data.data.filter((item: any) => item.status === 'completed').length;
          const achievementsData: AchievementData[] = [
            { title: "DeFi Explorer", description: "Complete 5 DeFi concepts", icon: "🏆", earned: completedCount >= 5 },
            { title: "Protocol Master", description: "Complete 10 protocols", icon: "🔥", earned: completedCount >= 10 },
            { title: "Yield Farmer", description: "Complete yield farming concepts", icon: "⚡", earned: completedCount >= 3 },
            { title: "Security Expert", description: "Complete all security modules", icon: "🛡️", earned: completedCount >= 8 },
          ];
          setAchievements(achievementsData);
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    const result = await updateProfile(editUsername, editEmail);
    
    if (result.success) {
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
      refreshProfile();
    } else {
      Alert.alert('Error', result.message || 'Failed to update profile');
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Sign Out", 
        style: "destructive", 
        onPress: async () => {
          await logout();
          router.replace('/');
        }
      }
    ]);
  };

  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditUsername(user?.username || '');
    setEditEmail(user?.email || '');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'courses', label: 'Courses', icon: '📚' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'settings', label: 'Settings', icon: '⚙' }
  ];

  const getInitials = () => {
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const displayUsername = user?.username || user?.email || 'Guest';
  const displayEmail = user?.email || 'Not logged in';

  const renderOverview = () => (
    <View className="gap-4 sm:gap-6">
      {/* Profile Stats */}
      <View className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg" style={{ backgroundColor: '#1b1717', borderWidth: 1, borderColor: '#c70000' }}>
        <Text className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: '#ede8dd' }}>DeFi Learning Stats</Text>
        <View className="flex-row gap-3 sm:gap-4">
          <View className="flex-1 items-center">
            <Text className="text-xl sm:text-2xl font-bold" style={{ color: '#ede8dd' }}>
              {loading ? '...' : userStats.totalConcepts}
            </Text>
            <Text className="text-xs sm:text-sm" style={{ color: '#ede8dd', opacity: 0.7 }}>Concepts</Text>
          </View>
          <View className="w-px" style={{ backgroundColor: '#c70000' }} />
          <View className="flex-1 items-center">
            <Text className="text-xl sm:text-2xl font-bold" style={{ color: '#ede8dd' }}>
              {loading ? '...' : `${Math.floor(userStats.totalTimeSpent / 60)}h`}
            </Text>
            <Text className="text-xs sm:text-sm" style={{ color: '#ede8dd', opacity: 0.7 }}>Learn Time</Text>
          </View>
          <View className="w-px" style={{ backgroundColor: '#c70000' }} />
          <View className="flex-1 items-center">
            <Text className="text-xl sm:text-2xl font-bold" style={{ color: '#ede8dd' }}>
              {loading ? '...' : userStats.currentStreak}
            </Text>
            <Text className="text-xs sm:text-sm" style={{ color: '#ede8dd', opacity: 0.7 }}>Streak</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg" style={{ backgroundColor: '#1b1717', borderWidth: 1, borderColor: '#c70000' }}>
        <Text className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: '#ede8dd' }}>Recent Activity</Text>
        <View className="gap-3 sm:gap-4">
          {courses.slice(0, 3).map((course, index) => {
            const action = course.status === 'Completed' ? 'Completed' : course.status === 'In Progress' ? 'Started' : 'Viewed';
            return (
              <View key={index} className="flex-row items-center gap-3 sm:gap-4">
                <View className="w-6 h-6 sm:w-8 sm:h-8 rounded-full items-center justify-center" style={{ backgroundColor: '#c70000', borderWidth: 1, borderColor: '#ede8dd' }}>
                  <Text className="text-xs" style={{ color: '#ede8dd' }}>✓</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs sm:text-sm font-medium" style={{ color: '#ede8dd' }}>
                    {action} {course.title}
                  </Text>
                  <Text className="text-xs" style={{ color: '#ede8dd', opacity: 0.5 }}>{course.progress}% complete</Text>
                </View>
              </View>
            );
          })}
          {courses.length === 0 && (
            <View className="py-4 items-center">
              <Text className="text-xs sm:text-sm" style={{ color: '#ede8dd', opacity: 0.5 }}>
                No recent activity yet
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderCourses = () => (
    <View className="gap-3 sm:gap-4">
      {courses.length > 0 ? (
        courses.map((course, index) => (
        <View key={index} className="rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg" style={{ backgroundColor: '#1b1717', borderWidth: 1, borderColor: '#c70000' }}>
          <View className="flex-row items-center justify-between mb-2 sm:mb-3">
            <Text className="text-sm sm:text-base font-semibold flex-1 mr-2" style={{ color: '#ede8dd' }}>
              {course.title}
            </Text>
            <View className="px-2 sm:px-3 py-1 rounded-full" style={{ 
              backgroundColor: course.status === 'Completed' ? '#ede8dd' : 
                             course.status === 'In Progress' ? '#c70000' : '#630000',
              borderWidth: 1,
              borderColor: course.status === 'Completed' ? '#ede8dd' : '#c70000'
            }}>
              <Text className="text-xs font-semibold" style={{ 
                color: course.status === 'Completed' ? '#3a0000' : '#ede8dd'
              }}>
                {course.status}
              </Text>
            </View>
          </View>
          
          {course.progress > 0 && (
            <View>
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs sm:text-sm" style={{ color: '#ede8dd', opacity: 0.7 }}>Progress</Text>
                <Text className="text-xs sm:text-sm" style={{ color: '#ede8dd', opacity: 0.7 }}>{course.progress}%</Text>
              </View>
              <View className="w-full h-2 rounded-full" style={{ backgroundColor: '#630000' }}>
                <View 
                  className="h-2 rounded-full"
                  style={{ 
                    width: `${course.progress}%`,
                    backgroundColor: '#c70000'
                  }}
                />
              </View>
            </View>
          )}
        </View>
        ))
      ) : (
        <View className="py-8 items-center">
          <Text className="text-sm" style={{ color: '#ede8dd', opacity: 0.5 }}>
            No courses started yet. Start learning from the Learn tab!
          </Text>
        </View>
      )}
    </View>
  );

  const renderAchievements = () => (
    <View className="gap-3 sm:gap-4">
      {achievements.length > 0 ? (
        achievements.map((achievement, index) => (
        <View key={index} className="rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg" style={{ 
          backgroundColor: '#1b1717',
          borderWidth: 1,
          borderColor: achievement.earned ? '#c70000' : '#630000',
          opacity: achievement.earned ? 1 : 0.5
        }}>
          <View className="flex-row items-center gap-3 sm:gap-4">
            <View className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl items-center justify-center" style={{ 
              backgroundColor: achievement.earned ? '#c70000' : '#630000',
              borderWidth: 1,
              borderColor: achievement.earned ? '#ede8dd' : '#c70000'
            }}>
              <Text className="text-lg sm:text-xl lg:text-2xl">{achievement.icon}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm sm:text-base lg:text-lg font-semibold" style={{ 
                color: achievement.earned ? '#ede8dd' : '#ede8dd',
                opacity: achievement.earned ? 1 : 0.5
              }}>
                {achievement.title}
              </Text>
              <Text className="text-xs sm:text-sm" style={{ 
                color: '#ede8dd',
                opacity: achievement.earned ? 0.7 : 0.4
              }}>
                {achievement.description}
              </Text>
            </View>
            {achievement.earned && (
              <View className="w-6 h-6 sm:w-8 sm:h-8 rounded-full items-center justify-center" style={{ backgroundColor: '#ede8dd', borderWidth: 1, borderColor: '#ede8dd' }}>
                <Text className="text-xs sm:text-sm" style={{ color: '#3a0000' }}>✓</Text>
              </View>
            )}
          </View>
        </View>
      )))
      : (
        <View className="py-8 items-center">
          <Text className="text-sm" style={{ color: '#ede8dd', opacity: 0.5 }}>
            Start completing lessons to earn achievements!
          </Text>
        </View>
      )}
    </View>
  );

  const renderSettings = () => (
    <View className="gap-3 sm:gap-4 pb-20 sm:pb-24">
      {[
        { title: "Notifications", subtitle: "Push notifications and email updates", icon: "🔔" },
        { title: "Privacy", subtitle: "Manage your privacy settings", icon: "🔒" },
        { title: "Account", subtitle: "Update your account information", icon: "👤" },
        { title: "Help & Support", subtitle: "Get help and contact support", icon: "❓" },
        { title: "About", subtitle: "App version and information", icon: "ℹ" }
      ].map((setting, index) => (
        <TouchableOpacity 
          key={index}
          className="rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg"
          style={{ backgroundColor: '#1b1717', borderWidth: 1, borderColor: '#c70000' }}
        >
          <View className="flex-row items-center gap-3 sm:gap-4">
            <View className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl items-center justify-center" style={{ backgroundColor: '#630000', borderWidth: 1, borderColor: '#c70000' }}>
              <Text className="text-lg sm:text-xl">{setting.icon}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm sm:text-base font-semibold" style={{ color: '#ede8dd' }}>
                {setting.title}
              </Text>
              <Text className="text-xs sm:text-sm" style={{ color: '#ede8dd', opacity: 0.7 }}>
                {setting.subtitle}
              </Text>
            </View>
            <Text className="text-base sm:text-lg" style={{ color: '#c70000' }}>›</Text>
          </View>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity 
        onPress={handleSignOut}
        className="rounded-xl sm:rounded-2xl p-3 sm:p-4"
        style={{ backgroundColor: '#c70000', borderWidth: 2, borderColor: '#ede8dd' }}
      >
        <View className="flex-row items-center gap-3 sm:gap-4">
          <View className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl items-center justify-center" style={{ backgroundColor: '#630000', borderWidth: 1, borderColor: '#ede8dd' }}>
            <Text className="text-lg sm:text-xl">🚪</Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm sm:text-base font-semibold" style={{ color: '#ede8dd' }}>
              Sign Out
            </Text>
            <Text className="text-xs sm:text-sm" style={{ color: '#ede8dd', opacity: 0.8 }}>
              Sign out of your account
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'courses': return renderCourses();
      case 'achievements': return renderAchievements();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <LinearGradient
          colors={['#3a0000', '#630000', '#1b1717']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />
        <ActivityIndicator size="large" color="#c70000" />
        <Text className="text-lg mt-4" style={{ color: '#ede8dd' }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Background Gradient */}
      <LinearGradient
        colors={['#3a0000', '#630000', '#1b1717']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-1">
          {/* Profile Header */}
          <View className="pb-4 sm:pb-6" style={{ borderBottomWidth: 2, borderBottomColor: '#c70000' }}>
            <View className="items-center pt-3 sm:pt-4 pb-4 sm:pb-6">
              {/* Profile Picture */}
              <View className="relative">
                <LinearGradient
                  colors={['#c70000', '#630000']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 3,
                    borderColor: '#ede8dd'
                  }}
                >
                  <Text className="text-2xl sm:text-3xl font-bold" style={{ color: '#ede8dd' }}>
                    {getInitials()}
                  </Text>
                </LinearGradient>
              </View>
              
              {/* User Info */}
              {editing ? (
                <View className="w-full px-4 mt-4">
                  <View className="mb-4">
                    <Text className="text-sm mb-2" style={{ color: '#ede8dd' }}>Username</Text>
                    <TextInput
                      placeholder="Username"
                      placeholderTextColor="#630000"
                      value={editUsername}
                      onChangeText={setEditUsername}
                      className="border-2 border-[#c70000] rounded-lg px-4 py-3 bg-[#1b1717]"
                      style={{ color: '#ede8dd' }}
                    />
                  </View>
                  <View className="mb-4">
                    <Text className="text-sm mb-2" style={{ color: '#ede8dd' }}>Email</Text>
                    <TextInput
                      placeholder="Email"
                      placeholderTextColor="#630000"
                      value={editEmail}
                      onChangeText={setEditEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className="border-2 border-[#c70000] rounded-lg px-4 py-3 bg-[#1b1717]"
                      style={{ color: '#ede8dd' }}
                    />
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={handleCancelEdit}
                      className="flex-1 py-3 rounded-lg border-2 border-[#c70000]"
                    >
                      <Text className="text-center font-semibold" style={{ color: '#ede8dd' }}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleUpdateProfile}
                      className="flex-1 py-3 rounded-lg bg-[#c70000]"
                    >
                      <Text className="text-center font-semibold" style={{ color: '#ede8dd' }}>
                        Save
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <Text className="text-xl sm:text-2xl font-bold mt-3 sm:mt-4 mb-1" style={{ color: '#ede8dd' }}>
                    {displayUsername}
                  </Text>
                  <Text className="text-sm sm:text-base mb-2" style={{ color: '#ede8dd', opacity: 0.7 }}>
                    {displayEmail}
                  </Text>
                  <View className="px-2 sm:px-3 py-1 rounded-full" style={{ backgroundColor: '#ede8dd', borderWidth: 1, borderColor: '#ede8dd' }}>
                    <Text className="text-xs sm:text-sm font-semibold" style={{ color: '#3a0000' }}>
                      {user ? 'Premium Member' : 'Guest'}
                    </Text>
                  </View>
                  
                  {user && (
                    <TouchableOpacity
                      onPress={handleEditProfile}
                      className="mt-3 sm:mt-4 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl"
                      style={{ backgroundColor: 'transparent', borderWidth: 1, borderColor: '#c70000' }}
                    >
                      <Text className="text-xs sm:text-sm font-semibold" style={{ color: '#ede8dd' }}>Edit Profile</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            {/* Tabs */}
            <View className="flex-row px-3 sm:px-4 gap-2">
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  className="flex-1 py-3 sm:py-4 items-center rounded-xl sm:rounded-2xl"
                  style={{
                    backgroundColor: activeTab === tab.id ? '#c70000' : '#630000',
                    borderWidth: 2,
                    borderColor: activeTab === tab.id ? '#ede8dd' : '#c70000',
                    shadowColor: activeTab === tab.id ? '#c70000' : 'transparent',
                    shadowOpacity: 0.6,
                    shadowRadius: 15,
                    shadowOffset: { width: 0, height: 0 },
                    elevation: activeTab === tab.id ? 10 : 5,
                  }}
                >
                  <View 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl items-center justify-center mb-1"
                    style={{
                      backgroundColor: activeTab === tab.id ? '#ede8dd' : '#3a0000',
                      borderWidth: 1,
                      borderColor: activeTab === tab.id ? '#ede8dd' : '#c70000',
                    }}
                  >
                    <Text className="text-lg sm:text-xl" style={{ 
                      color: activeTab === tab.id ? '#c70000' : '#ede8dd',
                    }}>
                      {tab.icon}
                    </Text>
                  </View>
                  <Text className="text-xs font-bold" style={{ 
                    color: '#ede8dd',
                    letterSpacing: 0.5,
                  }}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tab Content */}
          <ScrollView 
            className="flex-1 px-3 sm:px-4 pt-4 sm:pt-6" 
            showsVerticalScrollIndicator={false}
          >
            {renderTabContent()}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
