import {CanActivate, ExecutionContext, Injectable, mixin, NotFoundException, UnauthorizedException} from "@nestjs/common";
import {hasPermissions} from "partylens-permissions";
import {PartymembersService} from "../service/partymembers.service";

export const MemberPermissionGuard = (permissionBits: number): any => {

  @Injectable()
  class MemberPermissionGuardMixin implements CanActivate {
    constructor(
      private readonly partymembersService: PartymembersService
    ) {};

    async canActivate(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest();
      const { user, party } = req;

      req.userAsPartyMember = await this.partymembersService.findMemberFromUser(user.id, party.id);

      if (!req.userAsPartyMember) {
        throw new NotFoundException('Unexpected permission guard error: member not found');
      }

      return hasPermissions(req.userAsPartyMember.permissionBits, permissionBits);
    }
  }

  const guard = mixin(MemberPermissionGuardMixin);
  return guard;
}
