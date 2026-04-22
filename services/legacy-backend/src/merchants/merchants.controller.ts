import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { MerchantsService } from './merchants.service';

@Controller('merchants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get('transactions')
  @Roles(UserRole.MERCHANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getTransactions(@Req() req: any) {
    return this.merchantsService.getTransactions(Number(req.user.sub));
  }
}
