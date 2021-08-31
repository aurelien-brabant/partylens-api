import {IsNumber, Max, Min} from "class-validator";

export class CreatePartyItemParticipationDto {
  @IsNumber()
  @Min(1)
  @Max(99)
  amount: number;
}
