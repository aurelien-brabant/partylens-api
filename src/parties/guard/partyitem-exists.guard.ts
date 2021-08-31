import {CanActivate, ExecutionContext, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {PartyitemsService} from "../service/partyitems.service";

@Injectable()
export class PartyItemExistsGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => PartyitemsService))
    private readonly partyitemsService: PartyitemsService
  ) {};

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { partyId, itemId } = request.params;

    if (!itemId) {
      return false;
    }

    request.partyItem = await this.partyitemsService.findById(partyId, itemId);

    console.log(request.partyItem);

    if (!request.partyItem) {
      throw new NotFoundException(`Route error: party item with id #${partyId} does not exist for such user.`)
    }

    return true;
  }
}
