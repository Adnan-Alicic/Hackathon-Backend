import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { Configuration, OpenAIApi } from 'openai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GPTService implements OnApplicationBootstrap {
  constructor(private readonly prismaService: PrismaService) { }

  sessions: Record<string, string[]> = {};

  private config = new Configuration({
    apiKey: 'enterapikey',
  });

  private AI = new OpenAIApi(this.config);

  async onApplicationBootstrap() {
    await this.pullSessions();
  }

  private completionConfig = {
    davinci: (prompt: string, sessionId: string) => {
      return {
        model: 'text-davinci-003',
        prompt: [...(this.sessions[sessionId] ?? []), '\n\n' + prompt].join(''),
        temperature: 0.7,
        max_tokens: 512,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      };
    },
  };

  async queryChat(payload: string, passedSessionId?: string) {
    const sessionId = passedSessionId ?? (await this.startSession()).sessionId;

    const response = await this.AI.createCompletion(
      this.completionConfig.davinci(payload, sessionId),
    );

    const responseText = response.data.choices?.[0]?.text ?? '';

    this.sessions[sessionId].push(payload);
    this.sessions[sessionId].push(responseText);
    await this.prismaService.gPTSession.update({
      where: {
        id: sessionId,
      },
      data: {
        data: this.sessions[sessionId],
      },
    });

    return {
      payload,
      response: response.data,
      session: this.sessions[sessionId],
      sessionId,
    };
  }

  async startSession() {
    const session = await this.prismaService.gPTSession.create({
      data: {
        data: [],
      },
    });
    const sessionId = session.id;
    this.sessions[sessionId] = [];
    return { sessionId };
  }

  resetSession(sessionId: string) {
    this.sessions[sessionId] = [];
    return { sessionId, session: this.sessions[sessionId] };
  }

  getSession(sessionId: string) {
    return { sessionId, session: this.sessions[sessionId] };
  }

  getAllSessions() {
    return { session: this.sessions };
  }

  async pullSessions() {
    const sessions = await this.prismaService.gPTSession.findMany();
    sessions.forEach((session) => {
      this.sessions[session.id] = session.data;
    });
  }
}
