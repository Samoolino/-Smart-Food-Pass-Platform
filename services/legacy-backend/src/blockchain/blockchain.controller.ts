import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { BlockchainService } from './blockchain.service';

@Controller('blockchain')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('contract-info')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SPONSOR)
  getContractInfo() {
    return this.blockchainService.getContractInfo();
  }

  @Get('transaction/:txHash')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SPONSOR, UserRole.MERCHANT)
  getTransactionStatus(@Param('txHash') txHash: string) {
    return this.blockchainService.getTransactionStatus(txHash);
  }

  @Post('redeem-pass')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MERCHANT)
  logRedeemPass(
    @Body('passId') passId: number,
    @Body('merchantId') merchantId: number,
    @Body('amount') amount: number,
    @Body('transactionId') transactionId: number,
  ) {
    return this.blockchainService.logRedemption({
      passId: Number(passId),
      merchantId: Number(merchantId),
      amount: Number(amount),
      transactionId: Number(transactionId),
    });
  }
}
