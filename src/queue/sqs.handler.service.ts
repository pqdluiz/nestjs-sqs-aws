export class SqsHandlerService {
  constructor() {}
  
  async handleSqsEvent(job: any): Promise<any> {
    return job;
  }
}
