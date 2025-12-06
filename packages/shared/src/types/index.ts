/**
 * Shared types for Veterans First application
 */

// User roles in the system
export type UserRole =
  | "rider"
  | "driver"
  | "dispatcher"
  | "admin"
  | "business"
  | "family";

// Base user type
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Ride status
export type RideStatus =
  | "requested"
  | "confirmed"
  | "driver_assigned"
  | "driver_en_route"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

// Base ride type
export interface Ride {
  id: string;
  riderId: string;
  driverId?: string;
  status: RideStatus;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API response wrapper
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
