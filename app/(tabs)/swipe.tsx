import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useCardDispatch, useCardState } from '@/store/CardStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

const cards = [
  { id: '1', text: 'First Card' },
  { id: '2', text: 'Second Card' },
  { id: '3', text: 'Third Card' },
  { id: '4', text: 'Fourth Card' },
  { id: '5', text: 'Fifth Card' },
];

export default function SwipeScreen() {
  const { dislikedCards } = useCardState();
  const dispatch = useCardDispatch();

  const [cardIndex, setCardIndex] = useState(0);

  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  // Filter out disliked cards for rendering
  const filteredCards = useMemo(
    () => cards.filter(card => !dislikedCards.includes(card.id)),
    [dislikedCards]
  );

  // Reset card index to 0 if it goes beyond filtered cards length
  useEffect(() => {
    if (cardIndex >= filteredCards.length && filteredCards.length > 0) {
      setCardIndex(0);
    }
  }, [filteredCards.length, cardIndex]);

  const currentCard = filteredCards[cardIndex];

const handleSwipe = (direction: 'like' | 'dislike') => {
  if (!currentCard) return;

  if (direction === 'dislike') {
    // Add to dislikedCards - this will remove the card from filteredCards on next render
    dispatch({
      type: 'DISLIKE_CARD',
      id: currentCard.id,
    });

    // Do NOT increment cardIndex because the cards array shrinks
    translateX.value = 0;
    rotate.value = 0;
    return;
  }

  // direction === 'like': move to next card index normally
  setCardIndex(prevIndex => {
    const nextIndex = prevIndex + 1;
    return nextIndex >= filteredCards.length ? 0 : nextIndex;
  });

  translateX.value = 0;
  rotate.value = 0;
};


  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      translateX.value = event.translationX;
      rotate.value = event.translationX / 20;
    })
    .onEnd(() => {
      if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
        const direction = translateX.value > 0 ? 'like' : 'dislike';
        const toX = direction === 'like' ? SCREEN_WIDTH : -SCREEN_WIDTH;

        translateX.value = withSpring(toX, {}, () => {
          runOnJS(handleSwipe)(direction);
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

  if (!currentCard) {
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
          <Text style={styles.text}>{currentCard.text}</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: SCREEN_WIDTH - 40,
    height: 400,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});
