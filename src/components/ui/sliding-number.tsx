'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, MotionValue, useInView, useSpring, useTransform } from 'framer-motion';

function Digit({
  place,
  value,
  digitHeight,
  duration,
}: {
  place: number;
  value: number;
  digitHeight: number;
  duration: number;
}) {
  const valueRoundedToPlace = Math.floor(value / place);
  const animatedValue = useSpring(valueRoundedToPlace, {
    duration: duration * 1000, // Convert to milliseconds
  });

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
    <div style={{ height: digitHeight }} className="relative w-[1ch] tabular-nums overflow-hidden">
      {Array.from({ length: 10 }, (_, i) => (
        <Number key={i} mv={animatedValue} number={i} digitHeight={digitHeight} />
      ))}
    </div>
  );
}

function Number({ mv, number, digitHeight }: { mv: MotionValue<number>; number: number; digitHeight: number }) {
  const y = useTransform(mv, (latest: number) => {
    const placeValue = latest % 10;
    const offset = (10 + number - placeValue) % 10;

    let memo = offset * digitHeight;

    if (offset > 5) {
      memo -= 10 * digitHeight;
    }

    return memo;
  });

  return (
    <motion.span style={{ y }} className="absolute inset-0 flex items-center justify-center">
      {number}
    </motion.span>
  );
}

interface SlidingNumberProps {
  from: number;
  to: number;
  duration?: number;
  delay?: number;
  startOnView?: boolean;
  once?: boolean;
  className?: string;
  onComplete?: () => void;
  digitHeight?: number;
}

export function SlidingNumber({
  from,
  to,
  duration = 2,
  delay = 0,
  startOnView = true,
  once = false,
  className = '',
  onComplete,
  digitHeight = 40,
}: SlidingNumberProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once });
  const [currentValue, setCurrentValue] = useState(from);
  const animationStartedRef = useRef(false);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset when props change
    setCurrentValue(from);
    animationStartedRef.current = false;
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
  }, [from, to]);

  useEffect(() => {
    if (!startOnView || !isInView || animationStartedRef.current) return;
    
    animationStartedRef.current = true;

    const timer = setTimeout(() => {
      const startTime = Date.now();
      const startValue = from;
      const difference = to - startValue;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const newValue = startValue + difference * easeOutCubic;

        setCurrentValue(newValue);

        if (progress < 1) {
          animationIdRef.current = requestAnimationFrame(animate);
        } else {
          setCurrentValue(to);
          onComplete?.();
          animationIdRef.current = null;
        }
      };

      animationIdRef.current = requestAnimationFrame(animate);
    }, delay * 1000);

    return () => {
      clearTimeout(timer);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, [isInView, startOnView, from, to, duration, delay, onComplete]);

  const roundedValue = Math.round(currentValue);
  const absValue = Math.abs(roundedValue);
  const maxDigits = Math.max(Math.abs(from).toString().length, Math.abs(to).toString().length);
  const places = Array.from({ length: maxDigits }, (_, i) => Math.pow(10, maxDigits - i - 1));

  return (
    <div ref={ref} className={`flex items-center ${className}`}>
      {roundedValue < 0 && '-'}
      {places.map((place, index) => (
        <Digit
          key={`${place}-${index}`}
          place={place}
          value={absValue}
          digitHeight={digitHeight}
          duration={duration}
        />
      ))}
    </div>
  );
}
