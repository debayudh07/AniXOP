import { Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('overview');

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Opening profile editor...");
  };

  const handleCameraPress = () => {
    Alert.alert("Change Photo", "Opening camera/gallery...");
  };

  const handleSettingPress = (setting: string) => {
    Alert.alert("Settings", `Opening ${setting} settings...`);
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => console.log("Signed out") }
    ]);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'courses', label: 'Courses', icon: '📚' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'settings', label: 'Settings', icon: '⚙' }
  ];

  const renderOverview = () => (
    <View className="gap-4 sm:gap-6">
      {/* Profile Stats */}
      <View className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg" style={{ backgroundColor: '#1b1717', borderWidth: 1, borderColor: '#c70000' }}>
        <Text className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: '#ede8dd' }}>DeFi Learning Stats</Text>
        <View className="flex-row gap-3 sm:gap-4">
          <View className="flex-1 items-center">
            <Text className="text-xl sm:text-2xl font-bold" style={{ color: '#ede8dd' }}>8</Text>
            <Text className="text-xs sm:text-sm" style={{ color: '#ede8dd', opacity: 0.7 }}>Concepts</Text>
          </View>
          <View className="w-px" style={{ backgroundColor: '#c70000' }} />
          <View className="flex-1 items-center">
            <Text className="text-xl sm:text-2xl font-bold" style={{ color: '#ede8dd' }}>42h</Text>
            <Text className="text-xs sm:text-sm" style={{ color: '#ede8dd', opacity: 0.7 }}>Learn Time</Text>
          </View>
          <View className="w-px" style={{ backgroundColor: '#c70000' }} />
          <View className="flex-1 items-center">
            <Text className="text-xl sm:text-2xl font-bold" style={{ color: '#ede8dd' }}>7</Text>
            <Text className="text-xs sm:text-sm" style={{ color: '#ede8dd', opacity: 0.7 }}>Streak</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg" style={{ backgroundColor: '#1b1717', borderWidth: 1, borderColor: '#c70000' }}>
        <Text className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: '#ede8dd' }}>Recent Activity</Text>
        <View className="gap-3 sm:gap-4">
          {[
            { action: "Completed", course: "Liquidity Pools", time: "2h ago" },
            { action: "Started", course: "Token Sniping", time: "1d ago" },
            { action: "Earned", course: "DeFi Explorer", time: "3d ago" }
          ].map((item, index) => (
            <View key={index} className="flex-row items-center gap-3 sm:gap-4">
              <View className="w-6 h-6 sm:w-8 sm:h-8 rounded-full items-center justify-center" style={{ backgroundColor: '#c70000', borderWidth: 1, borderColor: '#ede8dd' }}>
                <Text className="text-xs" style={{ color: '#ede8dd' }}>✓</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs sm:text-sm font-medium" style={{ color: '#ede8dd' }}>
                  {item.action} {item.course}
                </Text>
                <Text className="text-xs" style={{ color: '#ede8dd', opacity: 0.5 }}>{item.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderCourses = () => (
    <View className="gap-3 sm:gap-4">
      {[
        { title: "Liquidity Pools", progress: 100, status: "Completed" },
        { title: "Token Sniping", progress: 75, status: "In Progress" },
        { title: "Rug Pull Prevention", progress: 0, status: "Not Started" },
        { title: "DeFi Basics", progress: 100, status: "Completed" }
      ].map((course, index) => (
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
      ))}
    </View>
  );

  const renderAchievements = () => (
    <View className="gap-3 sm:gap-4">
      {[
        { title: "DeFi Explorer", description: "Learn 5 DeFi concepts", icon: "🏆", earned: true },
        { title: "Protocol Master", description: "Master 10 protocols", icon: "🔥", earned: true },
        { title: "Yield Farmer", description: "Understand yield farming", icon: "⚡", earned: false },
        { title: "Security Expert", description: "Complete security modules", icon: "🛡️", earned: false }
      ].map((achievement, index) => (
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
      ))}
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
          onPress={() => handleSettingPress(setting.title)}
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
                  <Text className="text-2xl sm:text-3xl font-bold" style={{ color: '#ede8dd' }}>JD</Text>
                </LinearGradient>
                <TouchableOpacity 
                  onPress={handleCameraPress}
                  className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: '#c70000', borderWidth: 2, borderColor: '#ede8dd' }}
                >
                  <Text className="text-xs sm:text-sm">📷</Text>
                </TouchableOpacity>
              </View>
              
              {/* User Info */}
              <Text className="text-xl sm:text-2xl font-bold mt-3 sm:mt-4 mb-1" style={{ color: '#ede8dd' }}>
                John Doe
              </Text>
              <Text className="text-sm sm:text-base mb-2" style={{ color: '#ede8dd', opacity: 0.7 }}>
                john.doe@example.com
              </Text>
              <View className="px-2 sm:px-3 py-1 rounded-full" style={{ backgroundColor: '#ede8dd', borderWidth: 1, borderColor: '#ede8dd' }}>
                <Text className="text-xs sm:text-sm font-semibold" style={{ color: '#3a0000' }}>Premium Member</Text>
              </View>
              
              <TouchableOpacity
                onPress={handleEditProfile}
                className="mt-3 sm:mt-4 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl"
                style={{ backgroundColor: 'transparent', borderWidth: 1, borderColor: '#c70000' }}
              >
                <Text className="text-xs sm:text-sm font-semibold" style={{ color: '#ede8dd' }}>Edit Profile</Text>
              </TouchableOpacity>
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