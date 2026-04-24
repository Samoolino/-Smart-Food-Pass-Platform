import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ReviewKycDocumentDto } from './dto/review-kyc-document.dto';
import { UpdateOnboardingDraftDto } from './dto/update-onboarding-draft.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.usersService.findById(Number(req.user.sub));
  }

  @Put('profile')
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(Number(req.user.sub), dto);
  }

  @Get('onboarding-draft')
  async getOnboardingDraft(@Req() req: any) {
    return this.usersService.getOnboardingDraft(Number(req.user.sub));
  }

  @Put('onboarding-draft')
  async updateOnboardingDraft(@Req() req: any, @Body() dto: UpdateOnboardingDraftDto) {
    return this.usersService.updateOnboardingDraft(Number(req.user.sub), dto);
  }

  @Put(':userId/onboarding-draft/review')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  async reviewOnboardingKyc(@Req() req: any, @Param('userId') userId: string, @Body() dto: ReviewKycDocumentDto) {
    return this.usersService.reviewOnboardingKyc(Number(userId), dto, req.user.role);
  }
}
