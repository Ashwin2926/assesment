import Pusher from 'pusher-js/react-native';


const BACKEND_URL = 'http://127.0.0.1:8000';  
const PUSHER_APP_KEY = 'a634f54f94dbb9d6d523'
const PUSHER_CLUSTER = 'ap2';
  
if (!PUSHER_APP_KEY) {
  console.error('⚠️ PUSHER_APP_KEY is not set in environment variables!');
}

class EchoService {
  constructor() {
    this.pusher = null;
    this.channels = {};
  }

  init(authToken) {
    if (this.pusher) {
      console.log('🔌 Pusher already initialized');
      return;
    }

    console.log('🔌 Initializing Pusher...');
    console.log('📡 Cluster:', PUSHER_CLUSTER);
    console.log('🔑 Key:', PUSHER_APP_KEY ? 'Set' : 'Missing');

    this.pusher = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_CLUSTER,
      forceTLS: true,
      encrypted: true,
      authEndpoint: `${BACKEND_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/json',
        },
      },
    });

    // Connection state logging
    this.pusher.connection.bind('connected', () => {
      console.log('✅ Pusher connected');
    });

    this.pusher.connection.bind('disconnected', () => {
      console.log('❌ Pusher disconnected');
    });

    this.pusher.connection.bind('error', (err) => {
      console.error('❌ Pusher error:', err);
    });
  }

  disconnect() {
    if (this.pusher) {
      console.log('🚫 Disconnecting Pusher...');
      this.pusher.disconnect();
      this.pusher = null;
      this.channels = {};
    }
  }

  channel(channelName) {
    if (!this.pusher) {
      console.error('❌ Pusher not initialized. Call init() first.');
      return null;
    }

    if (this.channels[channelName]) {
      return this.channels[channelName];
    }

    console.log(`📡 Subscribing to channel: ${channelName}`);
    const channel = this.pusher.subscribe(channelName);
    this.channels[channelName] = channel;

    channel.bind('pusher:subscription_succeeded', () => {
      console.log(`✅ Successfully subscribed to ${channelName}`);
    });

    channel.bind('pusher:subscription_error', (error) => {
      console.error(`❌ Subscription error for ${channelName}:`, error);
    });

    return channel;
  }

  leave(channelName) {
    if (this.pusher && this.channels[channelName]) {
      console.log(`🚫 Leaving channel: ${channelName}`);
      this.pusher.unsubscribe(channelName);
      delete this.channels[channelName];
    }
  }
}

const echoService = new EchoService();
export default echoService;
