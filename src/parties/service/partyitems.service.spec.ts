import { Test, TestingModule } from '@nestjs/testing';
import { PartyitemsService } from './partyitems.service';

describe('PartyitemsService', () => {
  let service: PartyitemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartyitemsService],
    }).compile();

    service = module.get<PartyitemsService>(PartyitemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
