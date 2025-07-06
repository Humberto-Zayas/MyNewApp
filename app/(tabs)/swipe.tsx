import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

const cards = [
  { id: 1, text: 'First Card' },
  { id: 2, text: 'Second Card' },
  { id: 3, text: 'Third Card' },
];

export default function SwipeScreen() {
  const [cardIndex, setCardIndex] = useState(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  const handleSwipe = () => {
    setCardIndex((prev) => (prev + 1 < cards.length ? prev + 1 : 0));
    translateX.value = 0;
    rotate.value = 0;
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      rotate.value = event.translationX / 20;
    })
    .onEnd(() => {
      if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
        const toX = translateX.value > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH;
        translateX.value = withSpring(toX, {}, () => {
          runOnJS(handleSwipe)();
        });
      } else {
        translateX.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotateZ: `${rotate.value}deg` },
    ],
  }));

  if (cardIndex >= cards.length) {
    return (
      <View style={styles.centered}>
        <Text>No more cards</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Text style={styles.text}>{cards[cardIndex].text}</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: SCREEN_WIDTH - 40,
    height: 400,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
