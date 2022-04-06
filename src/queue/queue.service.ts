import * as AWS from 'aws-sdk';
import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { QueueInterface } from './interfaces/queue.interfaces';
import { QueueEntity } from './entities/queue.entity';

export const sqsService = new AWS.SQS({ region: 'us-east-1' });
export const QUEUE_URL = `https://sqs.us-east-1.amazonaws.com/account_id/`;
export const GENERAL_QUEUE = 'General-' + process.env.STAGE;

export class QueueService implements QueueInterface {
  public readonly logger: Logger;
  public readonly QUEUE_TYPE = GENERAL_QUEUE;

  constructor(
    private readonly name: string,
    public readonly configService: ConfigService,
    public readonly queueRepository: Repository<QueueEntity>,
  ) {
    this.logger = new Logger(name);
  }

  public async handle(job: any): Promise<void> {}

  public async perform(event: any): Promise<void> {
    return this.handle(event);
  }

  public async add(event: any, milliseconds?: number): Promise<unknown> {
    const queue = QUEUE_URL + this.QUEUE_TYPE;

    if (this.configService.get('QUEUE_ENABLED') === 'false') {
      await this.handle(event);
      return;
    }

    const params = {
      MessageBody: JSON.stringify(event),
      QueueUrl: queue,
    };

    if (milliseconds) {
      params['DelaySeconds'] = milliseconds / 1000;
    }

    return await this.send(params);
  }

  public async send(params: AWS.SQS.SendMessageRequest): Promise<unknown> {
    return new Promise((resolve, reject) => {
      return sqsService.sendMessage(params, function (err, data) {
        if (err) {
          console.log('SQS ERR:', 'Fail Send Message' + err);
          reject(err);
        } else {
          resolve(data.MessageId);
        }
      });
    });
  }
}
