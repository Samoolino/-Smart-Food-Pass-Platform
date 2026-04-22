import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('sponsor/dashboard')
  @Roles(UserRole.SPONSOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getSponsorDashboard(@Req() req: any) {
    return this.analyticsService.getSponsorDashboard(Number(req.user.sub));
  }

  @Get('sponsor/passes')
  @Roles(UserRole.SPONSOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getSponsorPasses(@Req() req: any) {
    return this.analyticsService.getSponsorPasses(Number(req.user.sub));
  }

  @Get('sponsor/redemptions')
  @Roles(UserRole.SPONSOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getSponsorRedemptions(@Req() req: any) {
    return this.analyticsService.getSponsorRedemptions(Number(req.user.sub));
  }

  @Get('sponsor/beneficiaries')
  @Roles(UserRole.SPONSOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getSponsorBeneficiaries(@Req() req: any) {
    return this.analyticsService.getSponsorBeneficiaries(Number(req.user.sub));
  }

  @Get('sponsor/products')
  @Roles(UserRole.SPONSOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getSponsorProducts(@Req() req: any) {
    return this.analyticsService.getSponsorProducts(Number(req.user.sub));
  }

  @Get('system/kpis')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getSystemKpis() {
    return this.analyticsService.getSystemKpis();
  }
}
