import {CanActivate, ExecutionContext, Injectable, NotFoundException} from "@nestjs/common";
import {PartiesService} from "./parties.service";

@Injectable()
export class UserExistsGuard implements CanActivate {
  constructor(
    private readonly partiesService: PartiesService
  ) {};

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { userId, partyId } = request.params;

    if (!userId || partyId) {
      return false;
    }

    //const party = await this.partiesService.findById(userId);
    return true;
  }
}
