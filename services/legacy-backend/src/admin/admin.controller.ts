import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Post('users/:id/approve')
  approveUser(@Req() req: any, @Param('id') id: string) {
    return this.adminService.approveUser(Number(req.user.sub), Number(id));
  }

  @Post('users/:id/deactivate')
  deactivateUser(@Req() req: any, @Param('id') id: string) {
    return this.adminService.deactivateUser(Number(req.user.sub), Number(id));
  }

  @Get('merchants')
  listMerchants() {
    return this.adminService.listMerchants();
  }

  @Post('merchants/:id/approve')
  approveMerchant(@Req() req: any, @Param('id') id: string) {
    return this.adminService.approveMerchant(Number(req.user.sub), Number(id));
  }

  @Put('merchants/:id/commission')
  setMerchantCommission(
    @Req() req: any,
    @Param('id') id: string,
    @Body('commissionRate') commissionRate: number,
  ) {
    return this.adminService.setMerchantCommission(Number(req.user.sub), Number(id), Number(commissionRate));
  }

  @Get('audit-logs')
  listAuditLogs() {
    return this.adminService.listAuditLogs();
  }
}
