import { Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";

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
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const renderOverview = () => (
    <View className="gap-4 sm:gap-6">
      {/* Profile Stats */}
      <View className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <Text className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4">Learning Stats</Text>
        <View className="flex-row gap-3 sm:gap-4">
          <View className="flex-1 items-center">
            <Text className="text-xl sm:text-2xl font-bold text-black">24</Text>
            <Text className="text-xs sm:text-sm text-gray-600">Courses</Text>
          </View>
          <View className="w-px bg-gray-200" />
          <View className="flex-1 items-center">
            <Text className="text-xl sm:text-2xl font-bold text-black">156h</Text>
            <Text className="text-xs sm:text-sm text-gray-600">Study Time</Text>
          </View>
          <View className="w-px bg-gray-200" />
          <View className="flex-1 items-center">
            <Text className="text-xl sm:text-2xl font-bold text-black">12</Text>
            <Text className="text-xs sm:text-sm text-gray-600">Streak</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <Text className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4">Recent Activity</Text>
        <View className="gap-3 sm:gap-4">
          {[
            { action: "Completed", course: "React Native Basics", time: "2h ago" },
            { action: "Started", course: "JavaScript Advanced", time: "1d ago" },
            { action: "Earned", course: "Code Master Badge", time: "3d ago" }
          ].map((item, index) => (
            <View key={index} className="flex-row items-center gap-3 sm:gap-4">
              <View className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-50 rounded-full items-center justify-center border border-blue-200">
                <Text className="text-blue-600 text-xs">✓</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs sm:text-sm font-medium text-black">
                  {item.action} {item.course}
                </Text>
                <Text className="text-xs text-gray-500">{item.time}</Text>
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
        { title: "React Native Fundamentals", progress: 100, status: "Completed" },
        { title: "Advanced JavaScript Patterns", progress: 75, status: "In Progress" },
        { title: "TypeScript Complete Guide", progress: 0, status: "Not Started" },
        { title: "UI/UX Design Principles", progress: 100, status: "Completed" }
      ].map((course, index) => (
        <View key={index} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between mb-2 sm:mb-3">
            <Text className="text-sm sm:text-base font-semibold text-black flex-1 mr-2">
              {course.title}
            </Text>
            <View className={`px-2 sm:px-3 py-1 rounded-full border ${
              course.status === 'Completed' ? 'bg-green-50 border-green-200' : 
              course.status === 'In Progress' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <Text className={`text-xs font-semibold ${
                course.status === 'Completed' ? 'text-green-700' : 
                course.status === 'In Progress' ? 'text-blue-700' : 'text-gray-700'
              }`}>
                {course.status}
              </Text>
            </View>
          </View>
          
          {course.progress > 0 && (
            <View>
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs sm:text-sm text-gray-600">Progress</Text>
                <Text className="text-xs sm:text-sm text-gray-600">{course.progress}%</Text>
              </View>
              <View className="w-full h-2 bg-gray-200 rounded-full">
                <View 
                  className="bg-black h-2 rounded-full"
                  style={{ width: `${course.progress}%` }}
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
        { title: "Code Master", description: "Complete 20 courses", icon: "🏆", earned: true },
        { title: "Streak Master", description: "Study for 30 days straight", icon: "🔥", earned: true },
        { title: "Speed Learner", description: "Complete 5 courses in a week", icon: "⚡", earned: false },
        { title: "Night Owl", description: "Study after midnight 10 times", icon: "🦉", earned: false }
      ].map((achievement, index) => (
        <View key={index} className={`bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100 ${
          achievement.earned ? 'opacity-100' : 'opacity-50'
        }`}>
          <View className="flex-row items-center gap-3 sm:gap-4">
            <View className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl items-center justify-center border ${
              achievement.earned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <Text className="text-lg sm:text-xl lg:text-2xl">{achievement.icon}</Text>
            </View>
            <View className="flex-1">
              <Text className={`text-sm sm:text-base lg:text-lg font-semibold ${
                achievement.earned ? 'text-black' : 'text-gray-500'
              }`}>
                {achievement.title}
              </Text>
              <Text className={`text-xs sm:text-sm ${
                achievement.earned ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {achievement.description}
              </Text>
            </View>
            {achievement.earned && (
              <View className="w-6 h-6 sm:w-8 sm:h-8 bg-green-50 rounded-full items-center justify-center border border-green-200">
                <Text className="text-green-600 text-xs sm:text-sm">✓</Text>
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
        { title: "About", subtitle: "App version and information", icon: "ℹ️" }
      ].map((setting, index) => (
        <TouchableOpacity 
          key={index} 
          onPress={() => handleSettingPress(setting.title)}
          className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100"
        >
          <View className="flex-row items-center gap-3 sm:gap-4">
            <View className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-lg sm:rounded-xl items-center justify-center border border-gray-200">
              <Text className="text-lg sm:text-xl">{setting.icon}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm sm:text-base font-semibold text-black">
                {setting.title}
              </Text>
              <Text className="text-xs sm:text-sm text-gray-600">
                {setting.subtitle}
              </Text>
            </View>
            <Text className="text-gray-400 text-base sm:text-lg">›</Text>
          </View>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity 
        onPress={handleSignOut}
        className="bg-red-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-red-200"
      >
        <View className="flex-row items-center gap-3 sm:gap-4">
          <View className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg sm:rounded-xl items-center justify-center border border-red-200">
            <Text className="text-lg sm:text-xl">🚪</Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm sm:text-base font-semibold text-red-600">
              Sign Out
            </Text>
            <Text className="text-xs sm:text-sm text-red-500">
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
    <View className="flex-1 bg-gray-50">
      {/* Profile Header */}
      <View className="bg-white pb-4 sm:pb-6">
        <View className="items-center pt-3 sm:pt-4 pb-4 sm:pb-6">
          {/* Profile Picture */}
          <View className="relative">
            <View className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full items-center justify-center">
              <Text className="text-white text-2xl sm:text-3xl font-bold">JD</Text>
            </View>
            <TouchableOpacity 
              onPress={handleCameraPress}
              className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 bg-black rounded-full items-center justify-center border-2 border-white"
            >
              <Text className="text-white text-xs sm:text-sm">📷</Text>
            </TouchableOpacity>
          </View>
          
          {/* User Info */}
          <Text className="text-xl sm:text-2xl font-bold text-black mt-3 sm:mt-4 mb-1">
            John Doe
          </Text>
          <Text className="text-sm sm:text-base text-gray-600 mb-2">
            john.doe@example.com
          </Text>
          <View className="bg-green-50 px-2 sm:px-3 py-1 rounded-full border border-green-200">
            <Text className="text-green-700 text-xs sm:text-sm font-semibold">Premium Member</Text>
          </View>
          
          <TouchableOpacity 
            onPress={handleEditProfile}
            className="mt-3 sm:mt-4 bg-gray-100 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl border border-gray-200"
          >
            <Text className="text-black text-xs sm:text-sm font-semibold">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row px-3 sm:px-4">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 sm:py-3 items-center rounded-lg sm:rounded-xl mx-1 ${
                activeTab === tab.id ? 'bg-black' : 'bg-transparent'
              }`}
            >
              <Text className={`text-base sm:text-lg mb-1 ${
                activeTab === tab.id ? 'text-white' : 'text-gray-400'
              }`}>
                {tab.icon}
              </Text>
              <Text className={`text-xs font-semibold ${
                activeTab === tab.id ? 'text-white' : 'text-gray-500'
              }`}>
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
  );
}
