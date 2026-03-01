import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../services/api';
import useTowingRequestEvents from '../hooks/useTowingRequestEvents';
import { toast } from 'sonner';
import { Clock, LogOut, Plus, ClipboardList } from 'lucide-react';

function Dashboard({ user, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch initial requests
  useEffect(() => {
    fetchRequests();
  }, []);

  // Real-time event handlers
  const handleRequestCreated = (event) => {
    console.log('Dashboard: New request created', event);
    setRequests(prev => [event.request, ...prev]);
    toast.success('New Towing Request Created!');
  };

  const handleRequestAccepted = (event) => {
    console.log('Dashboard: Request accepted', event);
    setRequests(prev =>
      prev.map(req => req.id === event.request.id ? event.request : req)
    );
    toast.info(`Request accepted by ${event.driver?.name || 'driver'}`);
  };

  const handleStatusChanged = (event) => {
    console.log('Dashboard: Status changed', event);
    setRequests(prev =>
      prev.map(req => req.id === event.request.id ? event.request : req)
    );
    toast.info(event.message);
  };

  // Subscribe to real-time events
  useTowingRequestEvents({
    onRequestCreated: handleRequestCreated,
    onRequestAccepted: handleRequestAccepted,
    onStatusChanged: handleStatusChanged,
  });

  const fetchRequests = async () => {
    try {
      const response = await requestService.getRequests();
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (err) {
      setError('Failed to load requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyles = (status) => {
    const styles = {
      pending: 'bg-amber-500/15 text-amber-400 border-amber-400/40',
      assigned: 'bg-blue-500/15 text-blue-400 border-blue-400/40',
      in_progress: 'bg-purple-500/15 text-purple-400 border-purple-400/40',
      completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-400/40',
      cancelled: 'bg-red-500/15 text-red-400 border-red-400/40',
    };
    return styles[status] || 'bg-slate-500/15 text-slate-400 border-slate-400/40';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
    
      <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-white">
              Tareeqk Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </div>

            <div className="flex items-center gap-4 border-l border-slate-700 pl-6">
              <span className="text-sm font-medium text-white">
                {user.name}
              </span>

              <button
                onClick={onLogout}
                className="p-2 rounded-md hover:bg-rose-500/10 hover:text-rose-400 transition"
                data-testid="logout-btn"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN  */}
      <main className="max-w-7xl mx-auto px-6 py-12">
      
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white">
              Active Requests
            </h2>
            <p className="text-slate-400 mt-1 text-sm">
              Real-time towing dispatch management
            </p>
          </div>

          <Link
            to="/new-request"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition active:scale-95"
            data-testid="new-request-btn"
          >
            <Plus className="w-5 h-5" />
            New Request
          </Link>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="text-slate-400 text-sm">
            Loading requests...
          </div>
        ) : (
          /* REQUEST GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {requests.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400">
                No requests yet. Create your first towing request!
              </div>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/40 transition"
                  data-testid="request-card"
                >
                  {/* STATUS + ID */}
                  <div className="flex justify-between items-center mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyles(request.status)}`}>
                      {request.status.toUpperCase()}
                    </span>

                    <span className="text-xs text-slate-500 font-mono">
                      #{request.id}
                    </span>
                  </div>

                  {/* CUSTOMER NAME */}
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {request.customer_name}
                  </h3>

                  {/* LOCATION */}
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    📍 {request.location}
                  </p>

                  {/* NOTE */}
                  {request.note && (
                    <p className="text-sm text-slate-500 mb-4 italic">
                      "{request.note}"
                    </p>
                  )}

                  {/* DRIVER */}
                  {request.driver && (
                    <div className="mb-4 text-sm text-blue-400">
                      Driver:{" "}
                      <span className="font-medium">
                        {request.driver.name}
                      </span>
                    </div>
                  )}

                  {/* FOOTER */}
                  <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(request.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
