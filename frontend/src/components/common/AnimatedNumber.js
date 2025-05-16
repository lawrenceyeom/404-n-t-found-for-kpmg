import React, { useState, useEffect, useRef } from 'react';

/**
 * AnimatedNumber - A component to animate number changes with smooth transitions
 * 
 * @param {number} value - The target number value to display
 * @param {function} format - Optional formatting function for the displayed value
 * @param {number} duration - Animation duration in milliseconds
 * @param {string} className - Optional CSS class name
 * @param {Object} style - Optional inline styles
 */
const AnimatedNumber = ({ 
  value = 0, 
  format = (val) => val, 
  duration = 800, 
  className = '', 
  style = {} 
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    // Skip animation on initial render
    if (prevValueRef.current === value) {
      return;
    }
    
    const startValue = prevValueRef.current;
    const endValue = value;
    const difference = endValue - startValue;
    
    const animateValue = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Apply easing function (easeOutCubic) for smoother animation
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + difference * easeProgress;
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateValue);
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
        startTimeRef.current = null;
      }
    };
    
    // Start animation
    animationFrameRef.current = requestAnimationFrame(animateValue);
    
    // Cleanup animation on unmount or when value changes
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration]);
  
  return (
    <span className={`animate-number ${className}`} style={style}>
      {format(displayValue)}
    </span>
  );
};

export default AnimatedNumber; 