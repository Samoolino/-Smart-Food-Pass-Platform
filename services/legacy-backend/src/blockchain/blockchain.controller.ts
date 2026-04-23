import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ReconciliationHistoryQueryDto } from './dto/reconciliation-history-query.dto';
import { BlockchainService } from './blockchain.service';
import { UpdateWalletMappingDto } from './dto/update-wallet-mapping.dto';

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

  @Get('mappings/summary')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getWalletMappingSummary() {
    return this.blockchainService.getWalletMappingSummary();
  }

  @Get('reconciliation/summary')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SPONSOR)
  getReconciliationSummary() {
    return this.blockchainService.getReconciliationSummary();
  }

  @Get('reconciliation/history')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SPONSOR)
  getReconciliationHistory(@Query() query: ReconciliationHistoryQueryDto) {
    return this.blockchainService.getReconciliationHistory(query);
  }

  @Put('mappings/users/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateUserWalletMapping(@Param('id') id: string, @Body() dto: UpdateWalletMappingDto) {
    return this.blockchainService.updateUserWalletMapping(Number(id), dto);
  }

  @Put('mappings/sponsors/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateSponsorWalletMapping(@Param('id') id: string, @Body() dto: UpdateWalletMappingDto) {
    return this.blockchainService.updateSponsorWalletMapping(Number(id), dto);
  }

  @Put('mappings/merchants/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateMerchantWalletMapping(@Param('id') id: string, @Body() dto: UpdateWalletMappingDto) {
    return this.blockchainService.updateMerchantWalletMapping(Number(id), dto);
  }

  @Post('issue-pass')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SPONSOR)
  issuePass(
    @Body('passId') passId: number,
    @Body('sponsorId') sponsorId: number,
    @Body('beneficiaryUserId') beneficiaryUserId: number,
    @Body('value') value: number,
    @Body('sponsorWalletAddress') sponsorWalletAddress?: string,
    @Body('beneficiaryWalletAddress') beneficiaryWalletAddress?: string,
  ) {
    return this.blockchainService.issuePass({
      passId: Number(passId),
      sponsorId: Number(sponsorId),
      beneficiaryUserId: Number(beneficiaryUserId),
      value: Number(value),
      sponsorWalletAddress,
      beneficiaryWalletAddress,
    });
  }

  @Post('redeem-pass')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MERCHANT)
  logRedeemPass(
    @Body('passId') passId: number,
    @Body('merchantId') merchantId: number,
    @Body('amount') amount: number,
    @Body('transactionId') transactionId: number,
    @Body('merchantWalletAddress') merchantWalletAddress?: string,
  ) {
    return this.blockchainService.logRedemption({
      passId: Number(passId),
      merchantId: Number(merchantId),
      amount: Number(amount),
      transactionId: Number(transactionId),
      merchantWalletAddress,
    });
  }
}
