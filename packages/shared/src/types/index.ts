/**
 * Shared types for Veterans First application
 */

// Re-export database types (Drizzle schema inferred types)
export type {
  User,
  NewUser,
  AuditLog,
  NewAuditLog,
} from "../db/schema";

// User roles in the system (compatible with DB schema role CHECK constraint)
export type UserRole =
  | "rider"
  | "driver"
  | "dispatcher"
  | "admin"
  | "family";

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
