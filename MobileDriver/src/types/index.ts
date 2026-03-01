export interface User {
  id: number;
  name: string;
  email: string;
  user_type: 'customer' | 'driver';
}

export interface Request {
  id: number;
  customer_id: number | null;
  driver_id: number | null;
  customer_name: string;
  location: string;
  latitude: string | null;
  longitude: string | null;
  note: string | null;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  customer?: User;
  driver?: User;
}

export interface TowingRequestEvent {
  request: Request;
  message: string;
}

export interface TowingRequestAcceptedEvent extends TowingRequestEvent {
  driver: User;
}

export interface TowingRequestStatusChangedEvent extends TowingRequestEvent {
  old_status: string;
  new_status: string;
}
