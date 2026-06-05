import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '@domain/user/repositories/user.repository.interface';
import { AppErrors } from '@application/exceptions/application.exception';
import { USER_REPOSITORY } from '@shared/constants/tokens';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const user = await this.users.findById(id);
    if (!user) throw AppErrors.NOT_FOUND('User not found.');
    await this.users.softDelete(id);
  }
}
