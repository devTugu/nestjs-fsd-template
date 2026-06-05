import { User } from '../entities/user.entity';
import { PaginatedResult } from '@shared/types/pagination';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  isActive: boolean;
}

export interface UpdateUserData {
  passwordHash?: string;
  isActive?: boolean;
}

export interface ListUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface IUserRepository {
  create(data: CreateUserData): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmailWithRolesAndPermissions(email: string): Promise<User | null>;
  findActiveById(id: number): Promise<User | null>;
  findAll(query: ListUsersQuery): Promise<PaginatedResult<User>>;
  update(id: number, data: UpdateUserData): Promise<User>;
  softDelete(id: number): Promise<void>;
  emailExists(email: string): Promise<boolean>;
}
