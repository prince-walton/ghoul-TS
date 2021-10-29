import { Bot } from '../../client/Client';
import { Message } from 'discord.js';

export interface RunFunction {
  (client: Bot, message: Message, args: string[]): Promise<void>;
}

export interface Command {
  name: string;
  category: string;
  cooldown: number;
  description: string;
  slash: boolean;
  argum?: Object;
  devs?: boolean;
  aliases?: Array<string>;

  run: RunFunction;
}
