import { Test, TestingModule } from '@nestjs/testing';
import { PartyitemsController } from './partyitems.controller';

describe('PartyitemsController', () => {
  let controller: PartyitemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartyitemsController],
    }).compile();

    controller = module.get<PartyitemsController>(PartyitemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
