import { Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.2:3000';

interface UserStats {
  totalTimeSpent: number;
  totalConceptsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  totalConcepts: number;
}

interface RecentActivity {
  conceptId: string;
  course: string;
  progress: number;
  status: string;
  time: string;
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [userStats, setUserStats] = useState<UserStats>({
    totalTimeSpent: 0,
    totalConceptsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalConcepts: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUserStats();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Refetch stats when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchUserStats();
      }
    }, [token])
  );

  const fetchUserStats = async () => {
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
          // Map concept IDs to titles
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

          // Convert to RecentActivity format and sort by lastOpenedAt
          const activities: RecentActivity[] = data.data
            .filter((item: any) => item.status !== 'not_started')
            .sort((a: any, b: any) => {
              const dateA = new Date(a.lastOpenedAt || a.completedAt).getTime();
              const dateB = new Date(b.lastOpenedAt || b.completedAt).getTime();
              return dateB - dateA;
            })
            .slice(0, 4)
            .map((item: any) => {
              const lastDate = item.lastOpenedAt || item.completedAt;
              const diffTime = new Date().getTime() - new Date(lastDate).getTime();
              const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
              const diffDays = Math.floor(diffHours / 24);
              
              let timeAgo = '';
              if (diffHours < 1) timeAgo = 'Just now';
              else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
              else if (diffDays === 1) timeAgo = '1d ago';
              else timeAgo = `${diffDays}d ago`;

              return {
                conceptId: item.conceptId,
                course: conceptMap[item.conceptId] || item.conceptId,
                progress: item.progress,
                status: item.status === 'completed' ? 'Completed' : 'In Progress',
                time: timeAgo
              };
            });
          
          setRecentActivity(activities);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
    <View className="flex-1">
      {/* Background Gradient */}
      <LinearGradient
        colors={['#3a0000', '#630000', '#1b1717']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-3 sm:px-4 py-4 sm:py-6">
            {/* Header */}
            <View className="mb-6 sm:mb-8">
              <Text className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#ede8dd' }}>
                DeFi Dashboard
              </Text>
              <Text className="text-sm sm:text-base" style={{ color: '#ede8dd', opacity: 0.7 }}>
                Welcome back, DeFi Learner! Track your protocol mastery.
              </Text>
            </View>

            {/* Stats Cards */}
            <View className="flex-row mb-4 sm:mb-6 gap-2 sm:gap-3">
              <View className="flex-1 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg" style={{ backgroundColor: '#630000', borderWidth: 1, borderColor: '#c70000' }}>
                <View className="flex-row items-center justify-between mb-3 sm:mb-4">
                  <View className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl items-center justify-center" style={{ backgroundColor: '#c70000' }}>
                    <Text className="text-sm sm:text-lg lg:text-xl">📚</Text>
                  </View>
                  <View className="px-2 sm:px-3 py-1 rounded-full" style={{ backgroundColor: '#ede8dd' }}>
                    <Text className="text-xs font-semibold" style={{ color: '#630000' }}>+12%</Text>
                  </View>
                </View>
                <Text className="text-lg sm:text-xl lg:text-2xl font-bold mb-1" style={{ color: '#ede8dd' }}>
                  {loading ? '...' : userStats.totalConcepts}
                </Text>
                <Text className="text-xs sm:text-sm" style={{ color: '#ede8dd', opacity: 0.8 }}>DeFi Concepts</Text>
              </View>

              <View className="flex-1 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg" style={{ backgroundColor: '#630000', borderWidth: 1, borderColor: '#c70000' }}>
                <View className="flex-row items-center justify-between mb-3 sm:mb-4">
                  <View className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl items-center justify-center" style={{ backgroundColor: '#c70000' }}>
                    <Text className="text-sm sm:text-lg lg:text-xl">⏱</Text>
                  </View>
                  <View className="px-2 sm:px-3 py-1 rounded-full" style={{ backgroundColor: '#ede8dd' }}>
                    <Text className="text-xs font-semibold" style={{ color: '#630000' }}>+8%</Text>
                  </View>
                </View>
                <Text className="text-lg sm:text-xl lg:text-2xl font-bold mb-1" style={{ color: '#ede8dd' }}>
                  {loading ? '...' : `${Math.floor(userStats.totalTimeSpent / 60)}h`}
                </Text>
                <Text className="text-xs sm:text-sm" style={{ color: '#ede8dd', opacity: 0.8 }}>Learning Time</Text>
              </View>
            </View>

            {/* Progress Chart */}
            <View className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg mb-4 sm:mb-6" style={{ backgroundColor: '#1b1717', borderWidth: 1, borderColor: '#c70000' }}>
              <View className="flex-row items-center justify-between mb-4 sm:mb-6">
                <Text className="text-base sm:text-lg font-semibold" style={{ color: '#ede8dd' }}>Learning Progress</Text>
                <View className="flex-row gap-1 sm:gap-2">
                  {['week', 'month', 'year'].map((timeframe) => (
                    <TouchableOpacity
                      key={timeframe}
                      onPress={() => handleTimeframeChange(timeframe)}
                      className="px-2 sm:px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: selectedTimeframe === timeframe ? '#c70000' : '#630000'
                      }}
                    >
                      <Text className="text-xs font-medium" style={{ color: '#ede8dd' }}>
                        {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Chart */}
              <View className="h-24 sm:h-32 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4" style={{ backgroundColor: '#3a0000' }}>
                <View className="flex-row items-end justify-between h-full gap-1 sm:gap-2">
                  {[40, 60, 45, 80, 70, 90, 85].map((height, index) => (
                    <View key={index} className="flex-1">
                      <View 
                        className="rounded-t"
                        style={{ 
                          height: `${height}%`,
                          backgroundColor: '#c70000'
                        }}
                      />
                    </View>
                  ))}
                </View>
              </View>
              
              <View className="flex-row justify-between">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <Text key={day} className="text-xs" style={{ color: '#ede8dd', opacity: 0.6 }}>{day}</Text>
                ))}
              </View>
            </View>

            {/* Recent Activity */}
            <View className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg mb-4 sm:mb-6" style={{ backgroundColor: '#1b1717', borderWidth: 1, borderColor: '#c70000' }}>
              <View className="flex-row items-center justify-between mb-4 sm:mb-6">
                <Text className="text-base sm:text-lg font-semibold" style={{ color: '#ede8dd' }}>Recent Activity</Text>
                <TouchableOpacity onPress={handleViewAllActivity}>
                  <Text className="text-xs sm:text-sm font-medium" style={{ color: '#c70000' }}>View All</Text>
                </TouchableOpacity>
              </View>
              
              <View className="gap-3 sm:gap-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((item, index) => (
                    <View key={index} className="flex-row items-center justify-between py-2 sm:py-3" style={{ borderBottomWidth: 1, borderBottomColor: '#630000' }}>
                      <View className="flex-1 mr-2">
                        <Text className="text-xs sm:text-sm font-medium mb-1" style={{ color: '#ede8dd' }}>{item.course}</Text>
                        <Text className="text-xs" style={{ color: '#ede8dd', opacity: 0.5 }}>{item.time}</Text>
                      </View>
                      <View className="flex-row items-center gap-2 sm:gap-3">
                        <View className="w-12 sm:w-16 h-2 rounded-full" style={{ backgroundColor: '#630000' }}>
                          <View 
                            className="h-2 rounded-full"
                            style={{ 
                              width: `${item.progress}%`,
                              backgroundColor: '#c70000'
                            }}
                          />
                        </View>
                        <View className="px-2 py-1 rounded-full" style={{ 
                          backgroundColor: item.status === 'Completed' ? '#ede8dd' : '#630000',
                          borderWidth: 1,
                          borderColor: item.status === 'Completed' ? '#ede8dd' : '#c70000'
                        }}>
                          <Text className="text-xs font-medium" style={{ 
                            color: item.status === 'Completed' ? '#3a0000' : '#ede8dd'
                          }}>
                            {item.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <View className="py-8 items-center">
                    <Text className="text-sm" style={{ color: '#ede8dd', opacity: 0.5 }}>
                      No recent activity yet. Start learning!
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Achievement & Streak */}
            <View className="flex-row mb-4 sm:mb-6 gap-2 sm:gap-3">
              <View className="flex-1 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg" style={{ backgroundColor: '#c70000', borderWidth: 2, borderColor: '#ede8dd' }}>
                <View className="flex-row items-center justify-between mb-3 sm:mb-4">
                  <Text className="text-lg sm:text-xl">🏆</Text>
                  <Text className="text-xs font-semibold" style={{ color: '#ede8dd' }}>NEW!</Text>
                </View>
                <Text className="text-base sm:text-lg font-bold mb-1" style={{ color: '#ede8dd' }}>Completed</Text>
                <Text className="text-sm" style={{ color: '#ede8dd', opacity: 0.9 }}>
                  {loading ? '...' : `${userStats.totalConceptsCompleted}`}
                </Text>
                <Text className="text-xs mt-2" style={{ color: '#ede8dd', opacity: 0.75 }}>Concepts mastered</Text>
              </View>

              <View className="flex-1 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg" style={{ backgroundColor: '#630000', borderWidth: 1, borderColor: '#c70000' }}>
                <View className="flex-row items-center justify-between mb-3 sm:mb-4">
                  <View className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl items-center justify-center" style={{ backgroundColor: '#c70000' }}>
                    <Text className="text-sm sm:text-lg lg:text-xl">🔥</Text>
                  </View>
                  <Text className="text-xs font-semibold" style={{ color: '#ede8dd' }}>7 days</Text>
                </View>
                <Text className="text-lg sm:text-xl lg:text-2xl font-bold mb-1" style={{ color: '#ede8dd' }}>
                  {loading ? '...' : userStats.currentStreak}
                </Text>
                <Text className="text-xs sm:text-sm" style={{ color: '#ede8dd', opacity: 0.8 }}>Day Streak</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg mb-6" style={{ backgroundColor: '#1b1717', borderWidth: 1, borderColor: '#c70000' }}>
              <Text className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: '#ede8dd' }}>Quick Actions</Text>
              <View className="flex-row gap-2 sm:gap-3">
                <TouchableOpacity 
                  onPress={handleContinueLearning}
                  className="flex-1 py-3 sm:py-4 rounded-lg sm:rounded-xl items-center shadow-lg"
                  style={{ backgroundColor: '#c70000' }}
                >
                  <Text className="text-sm sm:text-base font-semibold" style={{ color: '#ede8dd' }}>Continue Learning</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleBrowseCourses}
                  className="flex-1 py-3 sm:py-4 rounded-lg sm:rounded-xl items-center"
                  style={{ 
                    backgroundColor: '#630000',
                    borderWidth: 1,
                    borderColor: '#c70000'
                  }}
                >
                  <Text className="text-sm sm:text-base font-semibold" style={{ color: '#ede8dd' }}>Browse Concepts</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}