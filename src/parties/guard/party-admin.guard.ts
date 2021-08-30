import {ExecutionContext, forwardRef, Inject, UnauthorizedException} from "@nestjs/common";
import {PartymembersService} from "../service/partymembers.service";

/**
 * Assumes that a user and party objects are defined in the request object.
 * This is usually guaranteed by the previous use of JwtAuthGuard (for user) and
 * PartyExists guard (for party).
 */

export class PartyAdminGuard {
  constructor(
    @Inject(forwardRef(() => PartymembersService))
    private readonly partymembersService: PartymembersService
  ) {}

 async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    return true;
}
}
