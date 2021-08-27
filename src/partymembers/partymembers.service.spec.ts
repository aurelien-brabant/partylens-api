import { Test, TestingModule } from '@nestjs/testing';
import { PartymembersService } from './partymembers.service';

describe('PartymembersService', () => {
  let service: PartymembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartymembersService],
    }).compile();

    service = module.get<PartymembersService>(PartymembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
