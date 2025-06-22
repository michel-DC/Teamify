export interface StepProps {
  next?: () => void;
  prev?: () => void;
  formData: {
    name: string;
    bio: string;
    profileImage: string;
    memberCount: number;
    size: string;
    mission: string;
    file?: File;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      bio: string;
      profileImage: string;
      memberCount: number;
      size: string;
      mission: string;
      file?: File;
    }>
  >;
}
