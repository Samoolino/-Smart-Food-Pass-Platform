import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreatePassDto } from './dto/create-pass.dto';
import { RedeemPassDto } from './dto/redeem-pass.dto';
import { ValidateQrDto } from './dto/validate-qr.dto';
import { PassesService } from './passes.service';

@Controller('passes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PassesController {
  constructor(private readonly passesService: PassesService) {}

  @Post()
  @Roles(UserRole.SPONSOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createPass(@Req() req: any, @Body() dto: CreatePassDto) {
    return this.passesService.createPass(Number(req.user.sub), dto);
  }

  @Get()
  listPasses(@Req() req: any) {
    return this.passesService.listPassesForUser(Number(req.user.sub), req.user.role);
  }

  @Get(':id')
  getPass(@Param('id') id: string) {
    return this.passesService.getPassById(Number(id));
  }

  @Get(':id/qr')
  getPassQr(@Param('id') id: string) {
    return this.passesService.getPassQr(Number(id));
  }

  @Get(':id/transactions')
  getPassTransactions(@Param('id') id: string) {
    return this.passesService.getPassTransactions(Number(id));
  }

  @Post('validate-qr')
  @Roles(UserRole.MERCHANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  validateQr(@Body() dto: ValidateQrDto) {
    return this.passesService.validateQr(dto);
  }

  @Post('redeem')
  @Roles(UserRole.MERCHANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  redeemPass(@Req() req: any, @Body() dto: RedeemPassDto) {
    return this.passesService.redeemPass(Number(req.user.sub), dto);
  }
}
