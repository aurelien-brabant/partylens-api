import {CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import {UserEntity} from "src/users/entity/user.entity";
import {PartyEntity} from "../entity/party.entity";

/* XXX - IMPORTANT - XXX
 * This guard checks if a user belongs to a party, that is, if the user owns it or is
 * one of its members (administrator or not).
 * It assumes that a userResource object is available inside the request object, which
 * should be the case if UserExistsGuard has been applied before.
 * Therefore, any use of the PartyExistsGuard assumes that UserExistsGuard is also present.
*/

@Injectable()
export class PartyExistsGuard implements CanActivate {
  constructor(
  ) {};

  isUserInvolvedInParty(party: PartyEntity, userId: number): boolean
  {
    if (party.owner && userId == party.owner.id) {
      return true;
    }

    /* if any member is the targeted user, then it is involved */

    if (party.members) {
      for (const member of party.members) {
        if (member.user && member.user.id == userId) {
          return true;
        }
      }
    }

    return false;
  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const party: PartyEntity = request.partyResource;
    const user: UserEntity = request.userResource;

    return (this.isUserInvolvedInParty(party, user.id));
  }
}
