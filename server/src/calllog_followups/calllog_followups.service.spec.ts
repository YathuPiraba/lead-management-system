import { Test, TestingModule } from '@nestjs/testing';
import { CalllogFollowupsService } from './calllog_followups.service';

describe('CalllogFollowupsService', () => {
  let service: CalllogFollowupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalllogFollowupsService],
    }).compile();

    service = module.get<CalllogFollowupsService>(CalllogFollowupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
