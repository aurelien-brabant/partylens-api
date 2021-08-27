import { Test, TestingModule } from '@nestjs/testing';
import { PartymembersController } from './partymembers.controller';

describe('PartymembersController', () => {
  let controller: PartymembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartymembersController],
    }).compile();

    controller = module.get<PartymembersController>(PartymembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
