import { Test, TestingModule } from '@nestjs/testing';
import { SeedersService } from './seeders.service';

describe('SeedersService', () => {
  let service: SeedersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeedersService],
    }).compile();

    service = module.get<SeedersService>(SeedersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
