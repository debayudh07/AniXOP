import { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import AnimatedTitle from '@/components/ui/AnimatedTitle';
import { useAuth } from './context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // Animation values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(1)).current;
  const patternShift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating animation for books and caps
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.4,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pattern shift
    Animated.loop(
      Animated.timing(patternShift, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Helper: Animated shiny gradient text
  type ShinyTextProps = {
    children: React.ReactNode;
    style?: any;
    icon?: string;
  };
  
  const ShinyText = ({ children, style = {}, icon = "" }: ShinyTextProps) => {
    // Animated shimmer position
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: false,
        })
      ).start();
    }, []);

    // Interpolate left position for shimmer
    const shimmerLeft = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-80, 400],
    });

    return (
      <View style={{ position: 'relative', width: '100%', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <Text
          className="text-lg font-bold text-center"
          style={{
            backgroundColor: 'transparent',
            letterSpacing: 2,
            fontWeight: 'bold',
            color: 'white',
            textShadowColor: '#c70000',
            textShadowRadius: 12,
            paddingVertical: 2,
            ...style,
          }}
        >
          {icon ? icon + ' ' : ''}{children}
        </Text>
        {/* Shimmer overlay */}
        <Animated.View
          style={{
            position: 'absolute',
            left: shimmerLeft,
            top: 0,
            width: 80,
            height: '100%',
            opacity: 0.5,
            borderRadius: 4,
          }}
          pointerEvents="none"
        >
          <LinearGradient
            colors={["transparent", "#ede8dd", "#ffffff", "#ede8dd", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1, borderRadius: 4 }}
          />
        </Animated.View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#3a0000]">
      {/* Rich Gradient Background */}
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={['#3a0000', '#630000', '#991b1b', '#1b1717']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </View>

      {/* Cream accent overlay */}
      <View style={[StyleSheet.absoluteFillObject]} className="bg-[#ede8dd] opacity-[0.03]" />

      {/* Floating Book Elements */}
      <View style={[StyleSheet.absoluteFillObject]} className="opacity-[0.12]">
        {[...Array(15)].map((_, i) => (
          <Animated.View
            key={`book-${i}`}
            className="absolute rounded-sm border-l-[3px] border-[#1b1717]"
            style={{
              left: `${(i % 5) * 20 + 5}%`,
              top: `${Math.floor(i / 5) * 30 + 10}%`,
              width: 35,
              height: 45,
              backgroundColor: i % 3 === 0 ? '#ede8dd' : i % 3 === 1 ? '#991b1b' : '#c70000',
              transform: [
                {
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, i % 2 === 0 ? -25 : 25],
                  }),
                },
                {
                  translateX: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, (i % 3 - 1) * 15],
                  }),
                },
                { rotate: `${(i % 4 - 2) * 12}deg` },
              ],
            }}
          >
            {/* Book pages detail */}
            <View className="absolute right-[2px] top-[3px] bottom-[3px] w-[2px] bg-[#ede8dd] opacity-50" />
          </Animated.View>
        ))}
      </View>

      {/* Pencil/Pen Elements */}
      <View style={[StyleSheet.absoluteFillObject]} className="opacity-[0.08]">
        {[...Array(10)].map((_, i) => (
          <Animated.View
            key={`pencil-${i}`}
            className="absolute rounded-sm"
            style={{
              left: `${i * 10 + 2}%`,
              top: `${(i * 13 + 8) % 85}%`,
              width: 55,
              height: 6,
              backgroundColor: i % 2 === 0 ? '#c70000' : '#ede8dd',
              transform: [
                { rotate: `${i * 36}deg` },
                {
                  translateX: rotateAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, i % 2 === 0 ? 15 : -15, 0],
                  }),
                },
              ],
            }}
          >
            {/* Pencil tip */}
            <View
              style={{
                position: 'absolute',
                right: -6,
                top: -3,
                width: 0,
                height: 0,
                backgroundColor: 'transparent',
                borderStyle: 'solid',
                borderLeftWidth: 6,
                borderRightWidth: 0,
                borderBottomWidth: 6,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: i % 2 === 0 ? '#630000' : '#1b1717',
                transform: [{ rotate: '90deg' }],
              }}
            />
          </Animated.View>
        ))}
      </View>

      {/* Geometric Pattern Overlay */}
      <View style={[StyleSheet.absoluteFillObject]} className="opacity-[0.06]">
        {[...Array(8)].map((_, i) => (
          <Animated.View
            key={`geo-${i}`}
            className="absolute border-2"
            style={{
              left: `${i * 12.5}%`,
              top: '50%',
              width: 60,
              height: 60,
              borderColor: i % 2 === 0 ? '#c70000' : '#ede8dd',
              borderRadius: i % 3 === 0 ? 0 : 30,
              transform: [
                {
                  translateX: patternShift.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 50],
                  }),
                },
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            }}
          />
        ))}
      </View>

      {/* Graduation Cap Elements */}
      <View style={[StyleSheet.absoluteFillObject]} className="opacity-10">
        {[...Array(6)].map((_, i) => (
          <Animated.View
            key={`cap-${i}`}
            className="absolute"
            style={{
              left: `${(i % 3) * 33 + 15}%`,
              top: `${Math.floor(i / 3) * 50 + 15}%`,
              transform: [
                {
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, i % 2 === 0 ? 20 : -20],
                  }),
                },
                {
                  rotate: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', i % 2 === 0 ? '15deg' : '-15deg'],
                  }),
                },
              ],
            }}
          >
            {/* Cap board */}
            <View className="w-[50px] h-[6px] bg-[#630000] rounded-[1px]" />
            {/* Cap base */}
            <View className="w-[35px] h-[25px] bg-[#3a0000] rounded-sm mt-[-3px] ml-[7px]" />
            {/* Tassel */}
            <View className="absolute right-[12px] top-[-8px] w-[2px] h-[15px] bg-[#ede8dd]" />
          </Animated.View>
        ))}
      </View>

      {/* Light Sparkles */}
      <View style={[StyleSheet.absoluteFillObject]} className="opacity-20">
        {[...Array(20)].map((_, i) => (
          <Animated.View
            key={`sparkle-${i}`}
            className="absolute w-[3px] h-[3px] bg-[#ede8dd] rounded-full"
            style={{
              left: `${(i * 17 + 3) % 95}%`,
              top: `${(i * 23 + 5) % 90}%`,
              transform: [
                {
                  scale: glowAnim.interpolate({
                    inputRange: [1, 1.4],
                    outputRange: [1, i % 2 === 0 ? 2 : 1.6],
                  }),
                },
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', i % 2 === 0 ? '360deg' : '-360deg'],
                  }),
                },
              ],
            }}
          />
        ))}
      </View>

      {/* Subtle texture overlay */}
      <View style={[StyleSheet.absoluteFillObject]} className="bg-[#1b1717] opacity-40" />

      {/* Main Content Container */}
      <View className="flex-1 items-center justify-center p-5">
        {/* Content Frame Container */}
        <View className="w-full relative" style={{ maxWidth: 600, aspectRatio: 4/3 }}>
          {/* Corner Pieces with Cream/Cherry Red glow */}
          <View 
            className="absolute w-20 h-20 border-l-4 border-t-4 border-[#c70000]" 
            style={{ 
              top: -16,
              left: -16,
              shadowColor: '#c70000', 
              shadowOpacity: 0.8, 
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 0 },
              elevation: 10,
            }} 
          />
          <View 
            className="absolute w-20 h-20 border-r-4 border-t-4 border-[#c70000]"
            style={{ 
              top: -16,
              right: -16,
              shadowColor: '#c70000', 
              shadowOpacity: 0.8, 
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 0 },
              elevation: 10,
            }} 
          />
          <View 
            className="absolute w-20 h-20 border-l-4 border-b-4 border-[#c70000]"
            style={{ 
              bottom: -16,
              left: -16,
              shadowColor: '#c70000', 
              shadowOpacity: 0.8, 
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 0 },
              elevation: 10,
            }} 
          />
          <View 
            className="absolute w-20 h-20 border-r-4 border-b-4 border-[#c70000]"
            style={{ 
              bottom: -16,
              right: -16,
              shadowColor: '#c70000', 
              shadowOpacity: 0.8, 
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 0 },
              elevation: 10,
            }} 
          />

          {/* Content Area */}
          <View className="flex-1 items-center justify-center p-8">
            <View className="items-center">
              {/* Title with Gradient Effect */}
              <LinearGradient
                colors={['#ede8dd', '#c70000', '#630000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ 
                  marginBottom: 16, 
                  paddingHorizontal: 24, 
                  paddingVertical: 8, 
                  borderRadius: 8 
                }}
              >
                <AnimatedTitle />
              </LinearGradient>

              <Text 
                className="text-xl text-[#ede8dd] mb-8 text-center"
                style={{
                  textShadowColor: '#c70000',
                  textShadowRadius: 10,
                  letterSpacing: 1,
                }}
              >
                Master DeFi Protocols with AI
              </Text>

              {/* Main Button */}
              <View className="w-full" style={{ marginTop: 48, maxWidth: 320 }}>
                <TouchableOpacity 
                  onPress={() => router.push(isAuthenticated ? '/(tabs)/dashboard' : '/auth')}
                  className="border-2 border-[#c70000] py-4 px-8 rounded-lg items-center bg-[#3a0000]"
                  style={{
                    shadowColor: '#c70000',
                    shadowOpacity: 0.5,
                    shadowRadius: 20,
                    shadowOffset: { width: 0, height: 0 },
                    elevation: 10,
                  }}
                  activeOpacity={0.8}
                >
                  <ShinyText icon={isAuthenticated ? "📊" : "🔐"}>
                    {isAuthenticated ? 'DASHBOARD' : 'GET STARTED'}
                  </ShinyText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
