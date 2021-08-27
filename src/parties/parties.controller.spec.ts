import { Test, TestingModule } from '@nestjs/testing';
import { PartiesController } from './parties.controller';

describe('PartiesController', () => {
  let controller: PartiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartiesController],
    }).compile();

    controller = module.get<PartiesController>(PartiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
