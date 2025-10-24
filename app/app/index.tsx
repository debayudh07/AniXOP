import { Text, View, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

export default function HomePage() {
  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-3xl font-bold text-gray-900 mb-3 text-center">
          Welcome to AniXOP
        </Text>
        <Text className="text-lg text-gray-500 mb-10 text-center">
          Your learning journey starts here
        </Text>
        
        <View className="w-full max-w-xs">
          <Link href="/(tabs)/dashboard" asChild>
            <TouchableOpacity className="bg-blue-500 py-4 px-8 rounded-xl mb-4 items-center">
              <Text className="text-white text-base font-semibold">
                Go to Dashboard
              </Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/(tabs)/learn" asChild>
            <TouchableOpacity className="bg-transparent border-2 border-blue-500 py-4 px-8 rounded-xl mb-4 items-center">
              <Text className="text-blue-500 text-base font-semibold">
                Start Learning
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}
