import { Text, View, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { defiConcepts, type DeFiConcept } from '../services/gemini';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.2:3000';

interface LessonStatus {
  conceptId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
}

export default function Learn() {
  const router = useRouter();
  const { token } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [lessonStatuses, setLessonStatuses] = useState<Record<string, LessonStatus>>({});
  const conceptsPerPage = 6;

  useEffect(() => {
    if (token) {
      fetchLessonStatuses();
    }
  }, [token]);

  // Refetch lesson statuses when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchLessonStatuses();
      }
    }, [token])
  );

  const fetchLessonStatuses = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/defi/concepts/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const statusMap: Record<string, LessonStatus> = {};
          data.data.forEach((progress: LessonStatus) => {
            statusMap[progress.conceptId] = progress;
          });
          setLessonStatuses(statusMap);
        }
      }
    } catch (error) {
      console.error('Error fetching lesson statuses:', error);
    }
  };

  const categories = ['All', 'Basics', 'Trading', 'Security', 'Advanced'];
  
  const filteredConcepts = selectedCategory === 'All' 
    ? defiConcepts 
    : defiConcepts.filter((c: DeFiConcept) => c.category === selectedCategory);

  const totalPages = Math.ceil(filteredConcepts.length / conceptsPerPage);
  const startIndex = (currentPage - 1) * conceptsPerPage;
  const endIndex = startIndex + conceptsPerPage;
  const currentConcepts = filteredConcepts.slice(startIndex, endIndex);

  const handleConceptPress = (concept: DeFiConcept) => {
    router.push(`/concept/${concept.id}` as any);
  };

  const getLessonStatus = (conceptId: string): LessonStatus | undefined => {
    return lessonStatuses[conceptId];
  };

  const handleRestartLesson = async (conceptId: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-lesson/${conceptId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh the lesson statuses
        await fetchLessonStatuses();
      }
    } catch (error) {
      console.error('Error restarting lesson:', error);
    }
  };

  const renderConcept = ({ item }: { item: DeFiConcept }) => {
    const status = getLessonStatus(item.id);
    const isCompleted = status?.status === 'completed';
    const isInProgress = status?.status === 'in_progress';
    
    return (
      <TouchableOpacity 
        onPress={() => handleConceptPress(item)}
        className="rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4 shadow-lg"
        style={{ 
          backgroundColor: '#1b1717',
          borderWidth: isCompleted ? 3 : 2,
          borderColor: isCompleted ? '#ede8dd' : '#c70000'
        }}
      >
        <View className="flex-row items-start gap-3 sm:gap-4">
          <View className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl items-center justify-center" style={{ 
            backgroundColor: isCompleted ? '#ede8dd' : '#630000',
            borderWidth: 1, 
            borderColor: isCompleted ? '#ede8dd' : '#c70000' 
          }}>
            <Text className="text-lg sm:text-xl lg:text-2xl">{isCompleted ? '✓' : item.emoji}</Text>
          </View>
        
        <View className="flex-1">
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-sm sm:text-base lg:text-lg font-semibold flex-1 mr-2" style={{ color: '#ede8dd' }}>
              {item.title}
            </Text>
            {isCompleted && (
              <View className="px-2 py-1 rounded-full mr-2" style={{ 
                backgroundColor: '#ede8dd',
                borderWidth: 1,
                borderColor: '#ede8dd'
              }}>
                <Text className="text-xs font-semibold" style={{ color: '#3a0000' }}>
                  ✓ Complete
                </Text>
              </View>
            )}
            <View className="px-2 py-1 rounded-full" style={{ 
              backgroundColor: isInProgress ? '#c70000' : '#630000',
              borderWidth: 1,
              borderColor: isInProgress ? '#ede8dd' : '#c70000'
            }}>
              <Text className="text-xs font-semibold" style={{ color: '#ede8dd' }}>
                {item.estimatedTime}
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center mb-2 sm:mb-3 gap-2 sm:gap-3">
            <View className="px-2 py-1 rounded-full" style={{ 
              backgroundColor: item.category === 'Basics' ? '#ede8dd' : 
                             item.category === 'Trading' ? '#c70000' :
                             item.category === 'Security' ? '#c70000' : '#630000',
              borderWidth: 1,
              borderColor: item.category === 'Basics' ? '#ede8dd' : '#c70000'
            }}>
              <Text className="text-xs font-medium" style={{ 
                color: item.category === 'Basics' ? '#3a0000' : '#ede8dd'
              }}>
                {item.category}
              </Text>
            </View>
            <Text className="text-xs sm:text-sm" style={{ color: '#ede8dd', opacity: 0.5 }}>•</Text>
            <View className="px-2 py-1 rounded-full" style={{ 
              backgroundColor: item.difficulty === 'Beginner' ? '#ede8dd' : 
                             item.difficulty === 'Intermediate' ? '#c70000' : '#630000',
              borderWidth: 1,
              borderColor: item.difficulty === 'Beginner' ? '#ede8dd' : '#c70000'
            }}>
              <Text className="text-xs font-medium" style={{ 
                color: item.difficulty === 'Beginner' ? '#3a0000' : '#ede8dd'
              }}>
                {item.difficulty}
              </Text>
            </View>
          </View>
          
          {isInProgress && status.progress > 0 && (
            <View className="mb-2">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs" style={{ color: '#ede8dd', opacity: 0.7 }}>Progress</Text>
                <Text className="text-xs" style={{ color: '#ede8dd', opacity: 0.7 }}>{status.progress}%</Text>
              </View>
              <View className="w-full h-2 rounded-full" style={{ backgroundColor: '#630000' }}>
                <View 
                  className="h-2 rounded-full"
                  style={{ 
                    width: `${status.progress}%`,
                    backgroundColor: '#c70000'
                  }}
                />
              </View>
            </View>
          )}
          
          <View className="flex-row gap-2">
            <TouchableOpacity 
              onPress={() => handleConceptPress(item)}
              className="flex-1 py-2 rounded-lg items-center"
              style={{ 
                backgroundColor: isCompleted ? '#ede8dd' : (isInProgress ? '#c70000' : '#630000'),
                borderWidth: 1,
                borderColor: isCompleted ? '#ede8dd' : '#c70000'
              }}
            >
              <Text className="text-xs font-semibold" style={{ color: isCompleted ? '#3a0000' : '#ede8dd' }}>
                {isCompleted ? 'Review ✓' : isInProgress ? 'Continue →' : 'Learn with AI →'}
              </Text>
            </TouchableOpacity>
            
            {(isInProgress || isCompleted) && (
              <TouchableOpacity 
                onPress={() => handleRestartLesson(item.id)}
                className="py-2 px-3 rounded-lg items-center justify-center"
                style={{ 
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: '#c70000'
                }}
              >
                <Text className="text-xs font-semibold" style={{ color: '#ede8dd' }}>
                  🔄
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  const renderPagination = () => (
    <View className="flex-row items-center justify-center mt-4 sm:mt-6 gap-1 sm:gap-2">
      <TouchableOpacity 
        onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full items-center justify-center"
        style={{
          backgroundColor: currentPage === 1 ? '#630000' : '#c70000',
          borderWidth: 1,
          borderColor: currentPage === 1 ? '#630000' : '#ede8dd'
        }}
      >
        <Text className="text-xs sm:text-sm font-semibold" style={{ 
          color: '#ede8dd',
          opacity: currentPage === 1 ? 0.4 : 1
        }}>‹</Text>
      </TouchableOpacity>
      
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <TouchableOpacity
          key={page}
          onPress={() => setCurrentPage(page)}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full items-center justify-center"
          style={{
            backgroundColor: page === currentPage ? '#c70000' : '#630000',
            borderWidth: 1,
            borderColor: page === currentPage ? '#ede8dd' : '#c70000'
          }}
        >
          <Text className="text-xs sm:text-sm font-semibold" style={{ color: '#ede8dd' }}>
            {page}
          </Text>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity 
        onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full items-center justify-center"
        style={{
          backgroundColor: currentPage === totalPages ? '#630000' : '#c70000',
          borderWidth: 1,
          borderColor: currentPage === totalPages ? '#630000' : '#ede8dd'
        }}
      >
        <Text className="text-xs sm:text-sm font-semibold" style={{ 
          color: '#ede8dd',
          opacity: currentPage === totalPages ? 0.4 : 1
        }}>›</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#3a0000', '#630000', '#1b1717']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-1">
          <View className="px-3 sm:px-4 py-4 sm:py-6 pb-2">
            <Text className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#ede8dd' }}>
              DeFi Learning Hub
            </Text>
            <Text className="text-sm sm:text-base mb-4 sm:mb-6" style={{ color: '#ede8dd', opacity: 0.7 }}>
              Master DeFi protocols with AI-powered tutorials
            </Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => {
                      setSelectedCategory(category);
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 rounded-full"
                    style={{
                      backgroundColor: selectedCategory === category ? '#c70000' : '#630000',
                      borderWidth: 1,
                      borderColor: selectedCategory === category ? '#ede8dd' : '#c70000'
                    }}
                  >
                    <Text className="text-xs font-semibold" style={{ color: '#ede8dd' }}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <FlatList
            data={currentConcepts}
            renderItem={renderConcept}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />

          {renderPagination()}
          
          <View className="items-center pb-4 sm:pb-6">
            <Text className="text-xs sm:text-sm" style={{ color: '#ede8dd', opacity: 0.6 }}>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredConcepts.length)} of {filteredConcepts.length} concepts
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
