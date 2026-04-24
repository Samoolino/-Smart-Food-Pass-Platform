import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreatePaymentSettlementDto, CreateUserPlanDto } from './dto/payment-harness.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('plans')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SPONSOR)
  createUserPlan(@Body() dto: CreateUserPlanDto) {
    return this.paymentsService.createUserPlan(dto);
  }

  @Get('plans')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SPONSOR, UserRole.BENEFICIARY)
  listUserPlans(@Query('userId') userId?: string) {
    return this.paymentsService.listUserPlans(userId ? Number(userId) : undefined);
  }

  @Post('test/intent')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SPONSOR, UserRole.MERCHANT)
  createTestIntent(
    @Body('merchantId') merchantId: number,
    @Body('productId') productId: number,
    @Body('userId') userId: number,
    @Body('passId') passId: number | undefined,
    @Body('amount') amount: number,
    @Body('provider') provider?: string,
  ) {
    return this.paymentsService.createTestIntent({
      merchantId: Number(merchantId),
      productId: Number(productId),
      userId: Number(userId),
      passId: passId ? Number(passId) : undefined,
      amount: Number(amount),
      provider,
    });
  }

  @Post('test/settlements')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SPONSOR, UserRole.MERCHANT)
  createSettlement(@Body() dto: CreatePaymentSettlementDto) {
    return this.paymentsService.createSettlement(dto);
  }

  @Get('test/settlements')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SPONSOR, UserRole.MERCHANT)
  listSettlements(
    @Query('merchantId') merchantId?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
  ) {
    return this.paymentsService.listSettlements({
      merchantId: merchantId ? Number(merchantId) : undefined,
      userId: userId ? Number(userId) : undefined,
      status,
    });
  }
}
