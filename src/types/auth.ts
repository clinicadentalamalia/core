export interface AuthActionState {
  error: string | null;
}

export interface AppUser {
  displayName: string;
  roleCodes: string[];
}
