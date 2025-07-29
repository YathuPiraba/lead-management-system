import { Body, Controller, Post, Put } from '@nestjs/common';
import { SubscriptionService } from '../services/subscription.service';
import { ApiBadRequestResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { SubscriptionPlan } from '../entities/subscription_plans.entity';
import { SubscriptionPlanDto } from '../dto/create-subscription-plan.dto';
import { CreateFeaturesDto } from '../dto/features-create.dto';
import { Features } from '../entities/features.entity';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('create_subscription')
  @ApiCreatedResponse({
    type: SubscriptionPlan,
    description: 'Subscription plan created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Subscription plan with this name already exists',
  })
  async create(
    @Body() subscriptionPlanDto: SubscriptionPlanDto,
  ): Promise<SubscriptionPlan> {
    return this.subscriptionService.createSubscription(subscriptionPlanDto);
  }

  @Post('create_feature')
  @ApiCreatedResponse({
    type: 'Features',
    description: 'Feature created successfully',
  })
  async createFeature(
    @Body() createFeaturesDto: CreateFeaturesDto,
  ): Promise<Features> {
    return this.subscriptionService.createFeature(createFeaturesDto);
  }
}
