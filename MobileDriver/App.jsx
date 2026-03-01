import React, { useState, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Toast from 'react-native-toast-message';
import { authService, requestService, setAuthToken } from './src/services/api';
import echoService from './src/services/echo';
import useTowingRequestEvents from './src/hooks/useTowingRequestEvents';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState('driver@test.com');
  const [password, setPassword] = useState('password123');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
 
  const eventHandlers = useMemo(() => ({
    onRequestCreated: (event) => {
      const newRequest = event.request;
      setRequests(prev => [newRequest, ...prev]);
      Toast.show({
        type: 'success',
        text1: '🚗 New Towing Request!',
        text2: `From ${newRequest.customer_name} at ${newRequest.location}`,
      });
    },
    onRequestAccepted: (event) => {
      const updatedRequest = event.request;
      setRequests(prev => prev.map(req => req.id === updatedRequest.id ? updatedRequest : req));
      Toast.show({
        type: 'info',
        text1: '✅ Request Accepted',
        text2: `${updatedRequest.driver?.name || 'A driver'} accepted the request`,
      });
    },
    onStatusChanged: (event) => {
      const updatedRequest = event.request;
      setRequests(prev => prev.map(req => req.id === updatedRequest.id ? updatedRequest : req));
      Toast.show({
        type: 'info',
        text1: '🔄 Status Updated',
        text2: event.message,
      });
    },
    onConnected: () => {
      setIsRealtimeConnected(true);
      console.log('✅ Real-time connected');
    },
    onDisconnected: () => {
      setIsRealtimeConnected(false);
      console.log('❌ Real-time disconnected');
    },
    onError: (err) => {
      console.error('Real-time error:', err);
      setIsRealtimeConnected(false);
    },
  }), []);

  // Initialize Echo and subscribe to events when logged in
  useEffect(() => {
    if (isLoggedIn && token) {
      echoService.init(token);
      fetchRequests();
    }

    return () => {
      if (!isLoggedIn) {
        echoService.disconnect();
      }
    };
  }, [isLoggedIn, token]);

  // Subscribe to real-time events
  useTowingRequestEvents(isLoggedIn ? eventHandlers : {});

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.data.success) {
        setUser(response.data.user);
        setToken(response.data.token);
        setAuthToken(response.data.token);
        setIsLoggedIn(true);

        Toast.show({
          type: 'success',
          text1: 'Welcome!',
          text2: `Logged in as ${response.data.user.name}`,
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      Alert.alert('Login Failed', 'Please check your credentials');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await requestService.getRequests();
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch requests');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await requestService.acceptRequest(requestId);
      if (response.data.success) {
        Alert.alert('Success', 'Request accepted successfully!');
        fetchRequests(); // Refresh list
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to accept request';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
    setAuthToken(null);
    setRequests([]);
    setIsRealtimeConnected(false);
    echoService.disconnect();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fff3cd',
      assigned: '#d1ecf1',
      in_progress: '#e7d4ff',
      completed: '#d4edda',
      cancelled: '#f8d7da',
    };
    return colors[status] || '#e0e0e0';
  };

  if (!isLoggedIn) {
    return (
      <>
        <SafeAreaView style={styles.container}>
          <View style={styles.loginContainer}>
            <Text style={styles.title}>Tareeqk Driver</Text>
            <Text style={styles.subtitle}>Sign in to start accepting requests</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
              <Text style={styles.loginButtonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
            </TouchableOpacity>
            <Text style={styles.demoText}>
              Demo: driver@test.com / password123
            </Text>
          </View>
        </SafeAreaView>
        <Toast />
      </>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Tareeqk Driver</Text>
            <Text style={styles.headerSubtitle}>{user?.name}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.realtimeIndicator}>
          <View style={[styles.realtimeDot, { backgroundColor: isRealtimeConnected ? '#10b981' : '#ef4444' }]} />
          <Text style={styles.realtimeText}>
            {isRealtimeConnected ? '🟢 Real-time Active' : '🔴 Connecting...'}
          </Text>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#667eea" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🚕</Text>
                <Text style={styles.emptyText}>No Requests Yet</Text>
                <Text style={styles.emptySubtext}>Pull down to refresh</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.requestCard}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
                <Text style={styles.customerName}>{item.customer_name}</Text>
                <Text style={styles.location}>📍 {item.location}</Text>
                {item.note && <Text style={styles.note}>📝 {item.note}</Text>}
                {item.latitude && item.longitude && (
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: parseFloat(item.latitude),
                      longitude: parseFloat(item.longitude),
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                  >
                    <Marker coordinate={{ latitude: parseFloat(item.latitude), longitude: parseFloat(item.longitude) }} />
                  </MapView>
                )}
                {item.status === 'pending' && (
                  <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptRequest(item.id)}>
                    <Text style={styles.acceptButtonText}>✓ Accept Request</Text>
                  </TouchableOpacity>
                )}
                {item.driver && (
                  <View style={styles.driverInfoContainer}>
                    <Text style={styles.driverInfo}>Driver: {item.driver.name}</Text>
                  </View>
                )}
                <Text style={styles.timestamp}>
                  {new Date(item.created_at).toLocaleString()}
                </Text>
              </View>
            )}
          />
        )}
      </SafeAreaView>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#667eea',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#764ba2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
  },
  errorText: {
    color: '#ffe0e0',
    marginBottom: 15,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#764ba2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  realtimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  realtimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  realtimeText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  listContainer: {
    padding: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  location: {
    fontSize: 15,
    color: '#667eea',
    marginBottom: 8,
    fontWeight: '500',
  },
  note: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  map: {
    height: 150,
    borderRadius: 10,
    marginVertical: 10,
  },
  acceptButton: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  driverInfoContainer: {
    backgroundColor: '#d1ecf1',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  driverInfo: {
    fontSize: 14,
    color: '#0c5460',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
  },
});

export default App;
