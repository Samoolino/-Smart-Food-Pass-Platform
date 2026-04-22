import { Injectable } from '@nestjs/common';
import { PassesService } from '../passes/passes.service';

@Injectable()
export class MerchantsService {
  constructor(private readonly passesService: PassesService) {}

  getTransactions(actorUserId: number) {
    return this.passesService.getMerchantTransactions(actorUserId);
  }
}
