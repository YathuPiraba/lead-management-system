import { Test, TestingModule } from '@nestjs/testing';
import { CalllogFollowupsController } from './calllog_followups.controller';

describe('CalllogFollowupsController', () => {
  let controller: CalllogFollowupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalllogFollowupsController],
    }).compile();

    controller = module.get<CalllogFollowupsController>(CalllogFollowupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
