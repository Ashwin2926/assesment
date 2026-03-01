import { useEffect, useCallback, useRef } from 'react';
import echoService from '../services/echo';

/**
 * Custom hook for listening to real-time towing request events
 * 
 * @param {Object} callbacks - Event callbacks
 * @returns {Object} - Echo service instance
 */
const useTowingRequestEvents = (callbacks = {}) => {
  const channelRef = useRef(null);
  const callbacksRef = useRef(callbacks);

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const subscribeToChannel = useCallback(() => {
    // Unsubscribe from existing channel if any
    if (channelRef.current) {
      echoService.leave('towing-requests');
    }

    console.log('📡 Subscribing to towing-requests channel...');

    // Subscribe to the public towing-requests channel
    const channel = echoService.channel('towing-requests');
    
    if (!channel) {
      console.error('❌ Failed to get channel');
      return;
    }

    channelRef.current = channel;

    // Listen for new request created event
    if (callbacksRef.current.onRequestCreated) {
      channel.bind('request.created', (event) => {
        console.log('✅ New request created:', event);
        callbacksRef.current.onRequestCreated?.(event);
      });
    }

    // Listen for request accepted event
    if (callbacksRef.current.onRequestAccepted) {
      channel.bind('request.accepted', (event) => {
        console.log('✅ Request accepted:', event);
        callbacksRef.current.onRequestAccepted?.(event);
      });
    }

    // Listen for status changed event
    if (callbacksRef.current.onStatusChanged) {
      channel.bind('request.status.changed', (event) => {
        console.log('✅ Request status changed:', event);
        callbacksRef.current.onStatusChanged?.(event);
      });
    }

    // Listen for connection events
    if (callbacksRef.current.onConnected) {
      echoService.pusher?.connection.bind('connected', () => {
        callbacksRef.current.onConnected?.();
      });
    }

    if (callbacksRef.current.onDisconnected) {
      echoService.pusher?.connection.bind('disconnected', () => {
        callbacksRef.current.onDisconnected?.();
      });
    }

    if (callbacksRef.current.onError) {
      echoService.pusher?.connection.bind('error', (err) => {
        callbacksRef.current.onError?.(err);
      });
    }

    return channel;
  }, []);

  const unsubscribeFromChannel = useCallback(() => {
    console.log('🚫 Unsubscribing from towing-requests channel...');
    echoService.leave('towing-requests');
    channelRef.current = null;
  }, []);

  useEffect(() => {
    // Only subscribe if we have callbacks
    if (Object.keys(callbacks).length > 0) {
      subscribeToChannel();
    }

    // Cleanup on unmount
    return () => {
      unsubscribeFromChannel();
    };
  }, [subscribeToChannel, unsubscribeFromChannel]);

  return {
    echoService,
    subscribeToChannel,
    unsubscribeFromChannel,
  };
};

export default useTowingRequestEvents;
