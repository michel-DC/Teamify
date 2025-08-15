export interface StepProps {
  next?: () => void;
  prev?: () => void;
  exit?: () => void;
  formData: {
    name: string;
    bio: string;
    profileImage: string;
    organizationType: string;
    mission: string;
    location?: {
      city: string;
      lat: number;
      lon: number;
      displayName?: string;
    } | null;
    file?: File;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      bio: string;
      profileImage: string;
      organizationType: string;
      mission: string;
      location?: {
        city: string;
        lat: number;
        lon: number;
        displayName?: string;
      } | null;
      file?: File;
    }>
  >;
}
