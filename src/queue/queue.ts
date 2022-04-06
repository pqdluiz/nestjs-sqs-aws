import { Handler, Context } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';

import { AppModule } from '../app.module';
import { SqsHandlerService } from './sqs.handler.service';

let cachedServer: INestApplication;

async function bootstrapServer(): Promise<INestApplication> {
  if (!cachedServer) {
    const nestApp = await NestFactory.create(AppModule);

    await nestApp.init();
    cachedServer = nestApp;
  }
  return cachedServer;
}

export const handler: Handler = async (event: any) => {
  cachedServer = await bootstrapServer();
  const handlerCache = cachedServer.get(SqsHandlerService);

  const message = event.Records[0]; // this can be batch 
  const job = JSON.parse(message.body);
  return await handlerCache.handleSqsEvent(job);
}