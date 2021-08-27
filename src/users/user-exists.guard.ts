import {CanActivate, ExecutionContext, Injectable, NotFoundException} from "@nestjs/common";
import {Observable} from "rxjs";
import {UsersService} from "./users.service";

@Injectable()
export class UserExistsGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService
  ) {};

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { userId } = request.params;

    if (!userId) {
      return false;
    }

    return !!await this.usersService.findById(userId);
  }
}
