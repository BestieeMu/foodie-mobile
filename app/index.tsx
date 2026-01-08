import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, useWindowDimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { UtensilsCrossed, MapPin, TrendingUp } from 'lucide-react-native';

const SLIDES = [
  {
    id: '1',
    title: 'Delicious Meals',
    description: 'Order from the best local restaurants and get your favorite meals delivered hot and fresh.',
    Icon: UtensilsCrossed,
    color: '#FF6B35'
  },
  {
    id: '2',
    title: 'Fast Delivery',
    description: 'Real-time tracking from the kitchen to your doorstep. Never wonder where your food is.',
    Icon: MapPin,
    color: '#4C6EF5'
  },
  {
    id: '3',
    title: 'Earn With Us',
    description: 'Join our delivery fleet! Flexible hours, instant payouts, and great earnings for partners.',
    Icon: TrendingUp,
    color: '#38A169'
  }
];

const Indicator = ({ isActive }: { isActive: boolean }) => {
  const widthAnim = useRef(new Animated.Value(isActive ? 32 : 8)).current;
  const colorAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(widthAnim, {
        toValue: isActive ? 32 : 8,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(colorAnim, {
        toValue: isActive ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
  }, [isActive]);

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', '#FF6B35']
  });

  return (
    <Animated.View
      style={[
        styles.indicator,
        {
          width: widthAnim,
          backgroundColor,
        }
      ]}
    />
  );
};

export default function WelcomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < SLIDES.length - 1) {
        flatListRef.current?.scrollToIndex({
          index: currentIndex + 1,
          animated: true,
        });
        setCurrentIndex(prev => prev + 1);
      }
    }, 4000); 

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(prev => prev + 1);
    } else {
      router.push('/auth/signup');
    }
  };

  const handleSkip = () => {
    router.push('/auth/signup');
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
              <item.Icon size={80} color={item.color} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      {/* Footer */}
      <View style={styles.footer}>
        {/* Indicators */}
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, index) => (
            <Indicator key={index} isActive={currentIndex === index} />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button 
            title={currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"} 
            onPress={handleNext} 
            size="large"
          />
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/signin')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
    color: '#718096',
  },
  loginLink: {
    fontSize: 15,
    color: '#FF6B35',
    fontWeight: '600',
  },
});
