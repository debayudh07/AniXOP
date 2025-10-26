import { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, TextInput, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from './context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function AuthPage() {
  const router = useRouter();
  const { login, register, isAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isAuthenticated]);

  // Animation values
  const toggleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Toggle animation only
    Animated.spring(toggleAnim, {
      toValue: isLogin ? 0 : 1,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  }, [isLogin]);

  const handleAuth = async () => {
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isLogin && !username) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);

    try {
      let result;
      
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await register(email, password, username);
      }

      if (result.success) {
        Alert.alert('Success', isLogin ? 'Login successful!' : 'Registration successful!');
        router.replace('/(tabs)/dashboard');
      } else {
        setError(result.message || 'Something went wrong');
      }
    } catch (err: any) {
      setError('Network error. Please check your connection.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBackgroundColor = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#c70000', '#630000']
  });

  const toggleBorderRadius = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 10]
  });

  return (
    <View className="flex-1 bg-[#3a0000]">
      {/* Gradient Background */}
      <LinearGradient
        colors={['#3a0000', '#630000', '#991b1b', '#1b1717']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Subtle texture overlay */}
      <View style={[StyleSheet.absoluteFillObject]} className="bg-[#1b1717] opacity-40" />

      {/* Content */}
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <View style={{ maxWidth: 400, width: '100%' }}>
          {/* Logo/Title */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: '#c70000', borderWidth: 3, borderColor: '#ede8dd' }}>
              <Text className="text-4xl">🏛️</Text>
            </View>
            <Text className="text-3xl font-bold mb-2" style={{ color: '#ede8dd' }}>
              AniXOP
            </Text>
            <Text className="text-lg" style={{ color: '#ede8dd', opacity: 0.7 }}>
              DeFi Learning Platform
            </Text>
          </View>

          {/* Auth Form Card */}
          <View className="rounded-2xl p-6"
            style={{
              backgroundColor: '#1b1717',
              borderWidth: 2,
              borderColor: '#c70000',
              shadowColor: '#c70000',
              shadowOpacity: 0.5,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 0 },
              elevation: 10,
            }}
          >
            {/* Toggle Buttons */}
            <View className="flex-row mb-6 bg-[#3a0000] rounded-xl p-1">
              <TouchableOpacity
                onPress={() => setIsLogin(true)}
                style={{ flex: 1 }}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={{
                    backgroundColor: toggleBackgroundColor,
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    borderRadius: toggleBorderRadius,
                    alignItems: 'center',
                  }}
                >
                  <Text className="font-bold text-base" style={{ color: '#ede8dd' }}>
                    LOGIN
                  </Text>
                </Animated.View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsLogin(false)}
                style={{ flex: 1 }}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={{
                    backgroundColor: toggleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['#630000', '#c70000']
                    }),
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    borderRadius: toggleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 15]
                    }),
                    alignItems: 'center',
                  }}
                >
                  <Text className="font-bold text-base" style={{ color: '#ede8dd' }}>
                    REGISTER
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {error ? (
              <Animated.View
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 rounded-lg border-2 border-[#c70000]"
                style={{ backgroundColor: '#3a0000' }}
              >
                <Text className="text-sm text-center" style={{ color: '#c70000' }}>
                  {error}
                </Text>
              </Animated.View>
            ) : null}

            {/* Input Fields */}
            {!isLogin && (
              <View className="mb-4">
                <Text className="text-sm mb-2 font-semibold" style={{ color: '#ede8dd' }}>Username</Text>
                <TextInput
                  placeholder="Choose a username"
                  placeholderTextColor="#630000"
                  value={username}
                  onChangeText={setUsername}
                  className="border-2 border-[#c70000] rounded-lg px-4 py-3 bg-[#3a0000]"
                  style={{ color: '#ede8dd', fontSize: 16 }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            <View className="mb-4">
              <Text className="text-sm mb-2 font-semibold" style={{ color: '#ede8dd' }}>Email</Text>
              <TextInput
                placeholder="your@email.com"
                placeholderTextColor="#630000"
                value={email}
                onChangeText={setEmail}
                className="border-2 border-[#c70000] rounded-lg px-4 py-3 bg-[#3a0000]"
                style={{ color: '#ede8dd', fontSize: 16 }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm mb-2 font-semibold" style={{ color: '#ede8dd' }}>Password</Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#630000"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="border-2 border-[#c70000] rounded-lg px-4 py-3 bg-[#3a0000]"
                style={{ color: '#ede8dd', fontSize: 16 }}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#c70000', '#630000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 18,
                  paddingHorizontal: 32,
                  borderRadius: 12,
                  alignItems: 'center',
                  shadowColor: '#c70000',
                  shadowOpacity: 0.6,
                  shadowRadius: 15,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 10,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#ede8dd" size="small" />
                ) : (
                  <Text className="font-bold text-lg" style={{ color: '#ede8dd' }}>
                    {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Guest Access */}
            <View className="mt-6 items-center">
              <Text className="text-xs mb-2" style={{ color: '#ede8dd', opacity: 0.5 }}>
                OR
              </Text>
              <TouchableOpacity
                onPress={() => router.replace('/(tabs)/dashboard')}
                activeOpacity={0.8}
              >
                <Text className="text-sm font-semibold" style={{ color: '#c70000' }}>
                  Continue as Guest
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

