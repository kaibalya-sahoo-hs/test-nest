import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/adapters/ejs.adapter';
import { BullModule } from '@nestjs/bull';
import { MailProcessor } from './mail.processor';


@Module({
  imports: [],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
