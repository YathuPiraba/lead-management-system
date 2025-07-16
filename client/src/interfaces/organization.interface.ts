export interface OrganizationConfig {
  id: string;
  loginUrlSubdomain: string;
  emailFromName: string;
  brandingLogoUrl?: string | null;
  timezone: string;
  language: string;
}

export interface Organization {
  id: string;
  name: string;
  contactEmail: string;
  phoneNumber: string;
  country: string;
  isActive: boolean;
  firstAcceptedByUserId?: string | null;
  createdAt: string;
  config: OrganizationConfig;
}
