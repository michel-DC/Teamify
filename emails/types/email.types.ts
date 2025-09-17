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

export interface NotificationEmailData {
  notificationName: string;
  notificationDescription: string;
  notificationType:
    | "INFO"
    | "SUCCESS"
    | "WARNING"
    | "ERROR"
    | "INVITATION"
    | "REMINDER"
    | "UPDATE";
  eventTitle?: string;
  eventPublicId?: string;
  eventCode?: string;
  organizationName?: string;
  organizationPublicId?: string;
  notificationDate: string;
}

export interface WelcomeEmailData {
  userName: string;
  hasOrganization: boolean;
  organizationName?: string;
  organizationPublicId?: string;
}

export interface EmailServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
}
