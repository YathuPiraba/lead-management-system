import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from '../entities/subscription_plans.entity';
import { SubscriptionPlanDto } from '../dto/create-subscription-plan.dto';
import { CreateFeaturesDto } from '../dto/features-create.dto';
import { Features } from '../entities/features.entity';
import { SubscriptionPlanFeature } from '../entities/subscription_plan_features.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private subscriptionRepository: Repository<SubscriptionPlan>,
    @InjectRepository(Features)
    private featuresRepository: Repository<Features>,
    @InjectRepository(SubscriptionPlanFeature)
    private spfRepository: Repository<SubscriptionPlanFeature>,
  ) {}
  async createSubscription(
    subscriptionPlanDto: SubscriptionPlanDto,
  ): Promise<SubscriptionPlan> {
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { name: subscriptionPlanDto.name },
    });

    if (existingSubscription) {
      throw new ConflictException(
        'A subscription plan with this name already exists.',
      );
    }

    const { featureIds, ...planData } = subscriptionPlanDto;

    const subscriptionPlan = await this.subscriptionRepository.save(planData);

    if (featureIds?.length) {
      const features = await this.featuresRepository.findByIds(featureIds);

      if (features.length !== featureIds.length) {
        throw new ConflictException('One or more features not found.');
      }

      const mappings = features.map((feature) =>
        this.spfRepository.create({ subscriptionPlan, feature }),
      );

      await this.spfRepository.save(mappings);
    }

    return subscriptionPlan;
  }

  async createFeature(createFeaturesDto: CreateFeaturesDto): Promise<Features> {
    const existingFeature = await this.featuresRepository.findOne({
      where: [{ name: createFeaturesDto.name }],
    });
    if (existingFeature) {
      throw new ConflictException('A feature with this name already exists.');
    }
    return await this.featuresRepository.save(createFeaturesDto);
  }
}
