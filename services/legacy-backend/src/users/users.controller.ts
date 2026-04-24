import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
}
