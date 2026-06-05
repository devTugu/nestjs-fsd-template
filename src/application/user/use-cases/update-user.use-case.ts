import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '@domain/user/repositories/user.repository.interface';
import { IPasswordHasher } from '@application/ports/password-hasher.port';
import { AppErrors } from '@application/exceptions/application.exception';
import { UserOutput } from '@application/dto/user.dto';
import { toUserOutput } from '@application/dto/user-output.mapper';
import { USER_REPOSITORY, PASSWORD_HASHER } from '@shared/constants/tokens';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
  ) {}

  async execute(
    id: number,
    input: { password?: string; isActive?: boolean },
  ): Promise<UserOutput> {
    const existing = await this.users.findById(id);
    if (!existing) throw AppErrors.NOT_FOUND('User not found.');
    const passwordHash = input.password
      ? await this.hasher.hash(input.password)
      : undefined;
    const user = await this.users.update(id, {
      passwordHash,
      isActive: input.isActive,
    });
    return toUserOutput(user);
  }
}
