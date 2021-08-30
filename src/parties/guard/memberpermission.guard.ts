import {CanActivate, ExecutionContext, Injectable, mixin, UnauthorizedException} from "@nestjs/common";
import {NotFoundError} from "rxjs";
import {MPBit} from "../entity/partymember.entity";
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
        throw new NotFoundError('Unexpected permission guard error: member not found');
      }

      /* loop over each entry of the MPBit enum, converting each one into a number */
      for (const pBitString in MPBit) {
        const pBit = Number(pBitString);
 
        /**
         * If the entry is present in permissionBits, it should be too in loggedMember's permission bits.
         * In case it is not, the access is properly denied
         */

        if ((pBit & permissionBits) && !(loggedMember.permissionBits & pBit)) {
          throw new UnauthorizedException('Could not access route: missing member permission(s).');
        }
      }

      return true;
    }
  }

  const guard = mixin(MemberPermissionGuardMixin);
  return guard;
}
