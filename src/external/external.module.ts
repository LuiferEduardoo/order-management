import { Module } from '@nestjs/common';
import { ExternalValidationService } from './validation/external-validation.service';

@Module({
  exports: [ExternalValidationService],
  providers: [ExternalValidationService],
})
export class ExternalModule {}
