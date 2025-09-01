export interface EmailRecipient {
  email: string;
  name: string;
}

export interface EventInvitationData {
  eventName: string;
  eventCategory: string;
  eventDate?: string;
  eventLocation?: string;
  participantsCount: number;
  description?: string;
  invitationCode: string;
}

export interface OrganizationInvitationData {
  organizationName: string;
  organizationType: string;
  memberCount: number;
  mission?: string;
  bio?: string;
  inviteCode: string;
  inviterName: string;
}

export interface EmailServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
}
