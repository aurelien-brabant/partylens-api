import {CanActivate, ExecutionContext, Injectable, mixin, NotFoundException, UnauthorizedException} from "@nestjs/common";
import {PartymembersService} from "../service/partymembers.service";

export const MemberPermissionGuard = (permissionBits: number) => {

  @Injectable()
  class MemberPermissionGuardMixin implements CanActivate {
    constructor(
      private readonly partymembersService: PartymembersService
    ) {};

    async canActivate(context: ExecutionContext) {
      const { user, party } = context.switchToHttp().getRequest();

      const loggedMember = await this.partymembersService.findUserById(user.id, party.id);

      /* should never happen in pratice */
      if (!loggedMember) {
        throw new NotFoundException('Unexpected permission guard error: member not found');
      }
      
      return this.partymembersService.hasPermission(loggedMember, permissionBits);
    }
  }

  const guard = mixin(MemberPermissionGuardMixin);
  return guard;
}
