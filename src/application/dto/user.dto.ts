export interface UserOutput {
  id: number;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles: string[];
  permissionCodes: string[];
}
