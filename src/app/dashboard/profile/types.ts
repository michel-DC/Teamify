export interface UserProfile {
  uid: string;
  email: string;
  firstname: string;
  lastname: string;
  profileImage: string | null;
  createdAt: string;
  updatedAt: string;
  bio?: string;
  phone?: string;
  location?: {
    city: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  website?: string;
  dateOfBirth?: string;
}

export interface Organization {
  id: number;
  publicId: string;
  name: string;
  profileImage: string | null;
  memberCount: number;
  role: string;
}
