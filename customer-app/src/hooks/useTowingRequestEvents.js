import { useEffect, useCallback, useRef } from 'react';
import echo from '../services/echo';

/**
 * Custom hook for listening to real-time towing request events
 * 
 * @param {Object} callbacks - Event callbacks
 * @param {Function} callbacks.onRequestCreated - Callback when new request is created
 * @param {Function} callbacks.onRequestAccepted - Callback when request is accepted by driver
 * @param {Function} callbacks.onStatusChanged - Callback when request status changes
 * @returns {Object} - Echo instance and helper functions
 */
const useTowingRequestEvents = ({
  onRequestCreated,
  onRequestAccepted,
  onStatusChanged,
}) => {
  const channelRef = useRef(null);

  const subscribeToChannel = useCallback(() => {
    // Unsubscribe from existing channel if any
    if (channelRef.current) {
      echo.leave('towing-requests');
    }

    console.log('📡 Subscribing to towing-requests channel...');

    // Subscribe to the public towing-requests channel
    const channel = echo.channel('towing-requests');
    channelRef.current = channel;

    // Listen for new request created event
    if (onRequestCreated) {
      channel.listen('.request.created', (event) => {
        console.log('✅ New request created:', event);
        onRequestCreated(event);
      });
    }

    // Listen for request accepted event
    if (onRequestAccepted) {
      channel.listen('.request.accepted', (event) => {
        console.log('✅ Request accepted:', event);
        onRequestAccepted(event);
      });
    }

    // Listen for status changed event
    if (onStatusChanged) {
      channel.listen('.request.status.changed', (event) => {
        console.log('✅ Request status changed:', event);
        onStatusChanged(event);
      });
    }

    // Log successful subscription
    channel.subscribed(() => {
      console.log('✅ Successfully subscribed to towing-requests channel');
    });

    // Log errors
    channel.error((error) => {
      console.error('❌ Channel subscription error:', error);
    });

    return channel;
  }, [onRequestCreated, onRequestAccepted, onStatusChanged]);

  const unsubscribeFromChannel = useCallback(() => {
    console.log('🚫 Unsubscribing from towing-requests channel...');
    echo.leave('towing-requests');
    channelRef.current = null;
  }, []);

  useEffect(() => {
    const channel = subscribeToChannel();

    // Cleanup on unmount
    return () => {
      unsubscribeFromChannel();
    };
  }, [subscribeToChannel, unsubscribeFromChannel]);

  return {
    echo,
    subscribeToChannel,
    unsubscribeFromChannel,
  };
};

export default useTowingRequestEvents;
