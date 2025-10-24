import { Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Dashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  const handleContinueLearning = () => {
    Alert.alert("Continue Learning", "Redirecting to your current course...");
  };

  const handleBrowseCourses = () => {
    Alert.alert("Browse Courses", "Opening course catalog...");
  };

  const handleViewAllActivity = () => {
    Alert.alert("View All Activity", "Showing complete activity history...");
  };

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    Alert.alert("Timeframe Changed", `Showing data for ${timeframe}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <View className="mb-6 sm:mb-8">
          <Text className="text-2xl sm:text-3xl font-bold text-black mb-2">
            Dashboard
          </Text>
          <Text className="text-sm sm:text-base text-gray-600">
            Welcome back, John! Here's your learning overview.
          </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="flex-row mb-4 sm:mb-6 gap-2 sm:gap-3">
          <View className="flex-1 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-3 sm:mb-4">
              <View className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-50 rounded-lg sm:rounded-xl items-center justify-center">
                <Text className="text-blue-600 text-sm sm:text-lg lg:text-xl">📚</Text>
              </View>
              <View className="bg-green-50 px-2 sm:px-3 py-1 rounded-full border border-green-200">
                <Text className="text-green-700 text-xs font-semibold">+12%</Text>
              </View>
            </View>
            <Text className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-1">24</Text>
            <Text className="text-xs sm:text-sm text-gray-600">Courses Completed</Text>
          </View>

          <View className="flex-1 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-3 sm:mb-4">
              <View className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-50 rounded-lg sm:rounded-xl items-center justify-center">
                <Text className="text-purple-600 text-sm sm:text-lg lg:text-xl">⏱️</Text>
              </View>
              <View className="bg-blue-50 px-2 sm:px-3 py-1 rounded-full border border-blue-200">
                <Text className="text-blue-700 text-xs font-semibold">+8%</Text>
              </View>
            </View>
            <Text className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-1">156h</Text>
            <Text className="text-xs sm:text-sm text-gray-600">Study Time</Text>
          </View>
        </View>

        {/* Progress Chart */}
        <View className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-4 sm:mb-6">
          <View className="flex-row items-center justify-between mb-4 sm:mb-6">
            <Text className="text-base sm:text-lg font-semibold text-black">Learning Progress</Text>
            <View className="flex-row gap-1 sm:gap-2">
              {['week', 'month', 'year'].map((timeframe) => (
                <TouchableOpacity
                  key={timeframe}
                  onPress={() => handleTimeframeChange(timeframe)}
                  className={`px-2 sm:px-3 py-1 rounded-full ${
                    selectedTimeframe === timeframe ? 'bg-black' : 'bg-gray-100'
                  }`}
                >
                  <Text className={`text-xs font-medium ${
                    selectedTimeframe === timeframe ? 'text-white' : 'text-gray-600'
                  }`}>
                    {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Chart */}
          <View className="h-24 sm:h-32 bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
            <View className="flex-row items-end justify-between h-full gap-1 sm:gap-2">
              {[40, 60, 45, 80, 70, 90, 85].map((height, index) => (
                <View key={index} className="flex-1">
                  <View 
                    className="bg-black rounded-t"
                    style={{ height: `${height}%` }}
                  />
                </View>
              ))}
            </View>
          </View>
          
          <View className="flex-row justify-between">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <Text key={day} className="text-xs text-gray-500">{day}</Text>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-4 sm:mb-6">
          <View className="flex-row items-center justify-between mb-4 sm:mb-6">
            <Text className="text-base sm:text-lg font-semibold text-black">Recent Activity</Text>
            <TouchableOpacity onPress={handleViewAllActivity}>
              <Text className="text-black text-xs sm:text-sm font-medium">View All</Text>
            </TouchableOpacity>
          </View>
          
          <View className="gap-3 sm:gap-4">
            {[
              { course: "React Native Basics", progress: "100%", status: "Completed", time: "2h ago" },
              { course: "JavaScript Advanced", progress: "75%", status: "In Progress", time: "1d ago" },
              { course: "TypeScript Fundamentals", progress: "45%", status: "In Progress", time: "3d ago" },
              { course: "UI/UX Design", progress: "100%", status: "Completed", time: "1w ago" }
            ].map((item, index) => (
              <View key={index} className="flex-row items-center justify-between py-2 sm:py-3 border-b border-gray-100">
                <View className="flex-1 mr-2">
                  <Text className="text-xs sm:text-sm font-medium text-black mb-1">{item.course}</Text>
                  <Text className="text-xs text-gray-500">{item.time}</Text>
                </View>
                <View className="flex-row items-center gap-2 sm:gap-3">
                  <View className="w-12 sm:w-16 h-2 bg-gray-200 rounded-full">
                    <View 
                      className="bg-black h-2 rounded-full"
                      style={{ width: `${parseInt(item.progress)}%` }}
                    />
                  </View>
                  <View className={`px-2 py-1 rounded-full ${
                    item.status === 'Completed' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <Text className={`text-xs font-medium ${
                      item.status === 'Completed' ? 'text-green-700' : 'text-blue-700'
                    }`}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Achievement & Streak */}
        <View className="flex-row mb-4 sm:mb-6 gap-2 sm:gap-3">
          <View className="flex-1 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6">
            <View className="flex-row items-center justify-between mb-3 sm:mb-4">
              <Text className="text-white text-lg sm:text-xl">🏆</Text>
              <Text className="text-white text-xs font-semibold">NEW!</Text>
            </View>
            <Text className="text-white text-base sm:text-lg font-bold mb-1">Achievement</Text>
            <Text className="text-white text-sm opacity-90">Code Master</Text>
            <Text className="text-white text-xs opacity-75 mt-2">Complete 20 courses</Text>
          </View>

          <View className="flex-1 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-3 sm:mb-4">
              <View className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-50 rounded-lg sm:rounded-xl items-center justify-center">
                <Text className="text-orange-600 text-sm sm:text-lg lg:text-xl">🔥</Text>
              </View>
              <Text className="text-orange-600 text-xs font-semibold">7 days</Text>
            </View>
            <Text className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-1">12</Text>
            <Text className="text-xs sm:text-sm text-gray-600">Day Streak</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <Text className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4">Quick Actions</Text>
          <View className="flex-row gap-2 sm:gap-3">
            <TouchableOpacity 
              onPress={handleContinueLearning}
              className="flex-1 bg-black py-3 sm:py-4 rounded-lg sm:rounded-xl items-center"
            >
              <Text className="text-white text-sm sm:text-base font-semibold">Continue Learning</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleBrowseCourses}
              className="flex-1 bg-gray-100 py-3 sm:py-4 rounded-lg sm:rounded-xl items-center border border-gray-200"
            >
              <Text className="text-black text-sm sm:text-base font-semibold">Browse Courses</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
