export const staffRoleCodes = [
  "admin",
  "reception",
  "dentist",
  "facial_harmonization",
  "auditor",
] as const;

export const staffStatuses = ["pending", "active", "inactive"] as const;

export type StaffRoleCode = (typeof staffRoleCodes)[number];
export type StaffStatus = (typeof staffStatuses)[number];

export type StaffAccessActionState = {
  message: string | null;
  status: "idle" | "error" | "success";
};

export type StaffDirectoryEntry = {
  displayName: string | null;
  email: string | null;
  id: string;
  roleCodes: StaffRoleCode[];
  status: StaffStatus;
  updatedAt: string;
};

export type StaffRoleOption = {
  code: StaffRoleCode;
  name: string;
  scope: string;
};
