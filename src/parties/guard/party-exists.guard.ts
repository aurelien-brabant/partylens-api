import {CanActivate, ExecutionContext, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {PartiesService} from "../service/parties.service";

@Injectable()
export class PartyExistsGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => PartiesService))
    private readonly partiesService: PartiesService
  ) {};

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const userId = request.user.id;
    const { partyId } = request.params;

    if (!partyId) {
      return false;
    }

    request.party = await this.partiesService.findUserPartyById(userId, partyId);

    if (!request.party) {
      throw new NotFoundException(`Route error: party with id #${partyId} does not exist for such user.`)
    }

    return true;
  }
}
