import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { QueryBody } from './gpt.types';
import { GPTService } from './gpt.service';

@Controller('gpt')
export class GPTController {
  constructor(private readonly gptService: GPTService) {}
  @Post('/query')
  queryChatGPT(@Body() body: QueryBody) {
    return this.gptService.queryChat(body.payload, body.sessionId);
  }

  @Get('/session')
  getAllSessions() {
    return this.gptService.getAllSessions();
  }

  @Get('/session/:sessionId')
  getSession(@Param('sessionId') sessionId: string) {
    return this.gptService.getSession(sessionId);
  }

  @Post('/session/new')
  startSession() {
    return this.gptService.startSession();
  }

  @Delete('/session/:sessionId')
  resetSession(@Param('sessionId') sessionId: string) {
    return this.gptService.resetSession(sessionId);
  }
}
