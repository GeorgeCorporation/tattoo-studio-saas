import type { AppointmentStatus, PaymentMethod, PaymentType } from "@/lib/appointment-domain";

export interface Studio {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TattooArtist {
  id: string;
  studioId: string;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  specialties: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  studioId: string;
  artistId?: string;
  name: string;
  description?: string;
  durationMinutes: number;
  priceCents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  studioId: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  studioId: string;
  artistId: string;
  clientId: string;
  serviceId?: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  studioId: string;
  appointmentId?: string;
  clientId?: string;
  amountCents: number;
  type: PaymentType;
  method: PaymentMethod;
  status: "pending" | "paid" | "refunded" | "cancelled";
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  id: string;
  studioId: string;
  artistId?: string;
  title?: string;
  description?: string;
  imageUrl: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
