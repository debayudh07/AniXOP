import { useRef, useEffect } from 'react';
import { Animated, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AnimatedTitle() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1, 0.5],
  });

  return (
    <View style={{ position: 'relative', overflow: 'hidden' }}>
      <Text
        style={{
          fontSize: 42,
          fontWeight: 'bold',
          color: '#ede8dd',
          textAlign: 'center',
          letterSpacing: 4,
          textTransform: 'uppercase',
          textShadowColor: '#c70000',
          textShadowRadius: 15,
          textShadowOffset: { width: 0, height: 0 },
        }}
      >
        AniXOP
      </Text>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: shimmerOpacity,
        }}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['transparent', '#ede8dd', 'transparent']}
          start={{ x: -1, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

