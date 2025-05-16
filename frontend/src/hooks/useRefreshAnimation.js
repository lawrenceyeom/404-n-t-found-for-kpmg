import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing data refresh animations
 * @param {number} refreshInterval - Interval in ms between refreshes
 * @param {number} animationDuration - Duration in ms for the animation to last
 * @returns {Object} - Animation states and control functions
 */
export function useRefreshAnimation(refreshInterval = 5000, animationDuration = 3000) {
  const [refreshingItems, setRefreshingItems] = useState(new Set());
  const [isGlobalRefreshing, setIsGlobalRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(Date.now());
  const [refreshTimer, setRefreshTimer] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  // Start or trigger a refresh for specific items
  const refreshItems = useCallback((itemIds = []) => {
    // Update refresh state
    setRefreshingItems(new Set(itemIds));
    setIsGlobalRefreshing(true);
    setLastRefreshed(Date.now());
    
    // Clear refresh animation after duration
    setTimeout(() => {
      setRefreshingItems(new Set());
      setIsGlobalRefreshing(false);
    }, animationDuration);
  }, [animationDuration]);

  // Pause/resume auto refresh
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Set up auto refresh timer
  useEffect(() => {
    if (isPaused) {
      // Clear existing timer if paused
      if (refreshTimer) {
        clearInterval(refreshTimer);
        setRefreshTimer(null);
      }
      return;
    }

    // Create new refresh timer
    const timer = setInterval(() => {
      // Handle automatic refresh logic here, this would be customized
      // based on the specific component's needs
      setIsGlobalRefreshing(true);
      setLastRefreshed(Date.now());
      
      // Reset refresh state after animation duration
      setTimeout(() => {
        setIsGlobalRefreshing(false);
      }, animationDuration);
    }, refreshInterval);
    
    setRefreshTimer(timer);
    
    return () => {
      clearInterval(timer);
    };
  }, [refreshInterval, animationDuration, isPaused]);

  return {
    refreshingItems,
    isGlobalRefreshing,
    lastRefreshed,
    isPaused,
    refreshItems,
    togglePause,
    isRefreshing: (itemId) => refreshingItems.has(itemId)
  };
}

export default useRefreshAnimation; 