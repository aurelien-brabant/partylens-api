import {CanActivate, ExecutionContext, forwardRef, Inject, Injectable } from "@nestjs/common";
import {PartiesService} from "../service/parties.service";

@Injectable()
export class UserPartyGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => PartiesService))
    private readonly partiesService: PartiesService
  ) {};

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { userId, partyId } = request.params;

    if (!partyId) {
      return false;
    }

    return !!await this.partiesService.findUserPartyById(userId, partyId)
  }
}
