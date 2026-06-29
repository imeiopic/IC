export interface AuthUser {
  uid: string;
  email: string | null;
  biometricEnrolled?: boolean;
  biometricVerified?: boolean;
  // Add other user properties as needed
}
