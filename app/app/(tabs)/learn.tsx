import { Text, View, ScrollView, TouchableOpacity, FlatList, Alert, Dimensions } from "react-native";
import { useState } from "react";

const { width } = Dimensions.get('window');

interface Course {
  id: number;
  title: string;
  instructor: string;
  duration: string;
  level: string;
  rating: number;
  students: number;
  price: string;
  thumbnail: string;
  progress: number;
}

export default function Learn() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const coursesPerPage = 6;

  // Fake courses data
  const allCourses = [
    { id: 1, title: "React Native Fundamentals", instructor: "Sarah Johnson", duration: "8h 30m", level: "Beginner", rating: 4.8, students: 12500, price: "Free", thumbnail: "📱", progress: 0 },
    { id: 2, title: "Advanced JavaScript Patterns", instructor: "Mike Chen", duration: "12h 15m", level: "Advanced", rating: 4.9, students: 8900, price: "$49", thumbnail: "⚡", progress: 75 },
    { id: 3, title: "TypeScript Complete Guide", instructor: "Alex Rodriguez", duration: "15h 45m", level: "Intermediate", rating: 4.7, students: 15600, price: "$39", thumbnail: "🔷", progress: 0 },
    { id: 4, title: "UI/UX Design Principles", instructor: "Emma Wilson", duration: "6h 20m", level: "Beginner", rating: 4.6, students: 9800, price: "Free", thumbnail: "🎨", progress: 100 },
    { id: 5, title: "Node.js Backend Development", instructor: "David Kim", duration: "18h 30m", level: "Advanced", rating: 4.8, students: 11200, price: "$59", thumbnail: "🟢", progress: 45 },
    { id: 6, title: "Python for Data Science", instructor: "Lisa Zhang", duration: "20h 10m", level: "Intermediate", rating: 4.9, students: 18900, price: "$49", thumbnail: "🐍", progress: 0 },
    { id: 7, title: "Mobile App Design", instructor: "Tom Brown", duration: "7h 45m", level: "Beginner", rating: 4.5, students: 7600, price: "Free", thumbnail: "📲", progress: 0 },
    { id: 8, title: "GraphQL Masterclass", instructor: "Anna Smith", duration: "10h 25m", level: "Advanced", rating: 4.7, students: 5400, price: "$69", thumbnail: "🔺", progress: 0 },
    { id: 9, title: "Docker & Kubernetes", instructor: "James Lee", duration: "14h 15m", level: "Intermediate", rating: 4.8, students: 8700, price: "$59", thumbnail: "🐳", progress: 0 },
    { id: 10, title: "Machine Learning Basics", instructor: "Dr. Maria Garcia", duration: "16h 40m", level: "Intermediate", rating: 4.6, students: 12300, price: "$79", thumbnail: "🤖", progress: 0 },
    { id: 11, title: "Web Security Fundamentals", instructor: "Chris Taylor", duration: "9h 30m", level: "Beginner", rating: 4.7, students: 6800, price: "Free", thumbnail: "🔒", progress: 0 },
    { id: 12, title: "AWS Cloud Architecture", instructor: "Jennifer Park", duration: "22h 15m", level: "Advanced", rating: 4.9, students: 9500, price: "$89", thumbnail: "☁️", progress: 0 },
  ];

  const totalPages = Math.ceil(allCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const currentCourses = allCourses.slice(startIndex, endIndex);

  const handleCoursePress = (course: Course) => {
    Alert.alert("Course Selected", `Opening ${course.title} by ${course.instructor}`);
  };

  const handleSearch = () => {
    Alert.alert("Search", `Searching for: ${searchQuery}`);
  };

  const handleFilter = () => {
    Alert.alert("Filter", "Opening filter options...");
  };

  const renderCourse = ({ item }: { item: Course }) => (
    <TouchableOpacity 
      onPress={() => handleCoursePress(item)}
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
    >
      <View className="flex-row items-start" style={{ gap: 16 }}>
        <View className="w-16 h-16 bg-gray-50 rounded-xl items-center justify-center border border-gray-100">
          <Text className="text-2xl">{item.thumbnail}</Text>
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-lg font-semibold text-black flex-1 mr-2">
              {item.title}
            </Text>
            <View className={`px-2 py-1 rounded-full border ${
              item.price === 'Free' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
            }`}>
              <Text className={`text-xs font-semibold ${
                item.price === 'Free' ? 'text-green-700' : 'text-blue-700'
              }`}>
                {item.price}
              </Text>
            </View>
          </View>
          
          <Text className="text-sm text-gray-600 mb-2">by {item.instructor}</Text>
          
          <View className="flex-row items-center mb-3" style={{ gap: 12 }}>
            <View className="flex-row items-center">
              <Text className="text-yellow-500 text-sm">⭐</Text>
              <Text className="text-sm text-gray-600 ml-1">{item.rating}</Text>
            </View>
            <Text className="text-sm text-gray-600">•</Text>
            <Text className="text-sm text-gray-600">{item.duration}</Text>
            <Text className="text-sm text-gray-600">•</Text>
            <View className={`px-2 py-1 rounded-full border ${
              item.level === 'Beginner' ? 'bg-green-50 border-green-200' : 
              item.level === 'Intermediate' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
            }`}>
              <Text className={`text-xs font-medium ${
                item.level === 'Beginner' ? 'text-green-700' : 
                item.level === 'Intermediate' ? 'text-yellow-700' : 'text-red-700'
              }`}>
                {item.level}
              </Text>
            </View>
          </View>
          
          {item.progress > 0 && (
            <View className="mb-2">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs text-gray-600">Progress</Text>
                <Text className="text-xs text-gray-600">{item.progress}%</Text>
              </View>
              <View className="w-full h-2 bg-gray-200 rounded-full">
                <View 
                  className="bg-black h-2 rounded-full"
                  style={{ width: `${item.progress}%` }}
                />
              </View>
            </View>
          )}
          
          <Text className="text-xs text-gray-500">{item.students.toLocaleString()} students</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPagination = () => (
    <View className="flex-row items-center justify-center mt-6" style={{ gap: 8 }}>
      <TouchableOpacity 
        onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`w-10 h-10 rounded-full items-center justify-center border ${
          currentPage === 1 ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
        }`}
      >
        <Text className={`text-sm font-semibold ${
          currentPage === 1 ? 'text-gray-400' : 'text-black'
        }`}>‹</Text>
      </TouchableOpacity>
      
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <TouchableOpacity
          key={page}
          onPress={() => setCurrentPage(page)}
          className={`w-10 h-10 rounded-full items-center justify-center border ${
            page === currentPage ? 'bg-black border-black' : 'bg-white border-gray-300'
          }`}
        >
          <Text className={`text-sm font-semibold ${
            page === currentPage ? 'text-white' : 'text-black'
          }`}>
            {page}
          </Text>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity 
        onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`w-10 h-10 rounded-full items-center justify-center border ${
          currentPage === totalPages ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
        }`}
      >
        <Text className={`text-sm font-semibold ${
          currentPage === totalPages ? 'text-gray-400' : 'text-black'
        }`}>›</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-6 pb-2">
        <Text className="text-3xl font-bold text-black mb-2">
          Learn
        </Text>
        <Text className="text-base text-gray-600 mb-6">
          Discover new skills and advance your career
        </Text>
        
        {/* Search and Filter */}
        <View className="flex-row mb-4" style={{ gap: 12 }}>
          <TouchableOpacity 
            onPress={handleSearch}
            className="flex-1 bg-white rounded-xl px-4 py-3 flex-row items-center border border-gray-200"
          >
            <Text className="text-gray-400 text-lg">🔍</Text>
            <Text className="text-gray-400 ml-2">Search courses...</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleFilter}
            className="bg-white rounded-xl px-4 py-3 items-center justify-center border border-gray-200"
          >
            <Text className="text-gray-600">⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Courses List */}
      <FlatList
        data={currentCourses}
        renderItem={renderCourse}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Pagination */}
      {renderPagination()}
      
      {/* Page Info */}
      <View className="items-center pb-6">
        <Text className="text-sm text-gray-500">
          Showing {startIndex + 1}-{Math.min(endIndex, allCourses.length)} of {allCourses.length} courses
        </Text>
      </View>
    </View>
  );
}
