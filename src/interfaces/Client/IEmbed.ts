import { Message, MessageEmbedOptions } from 'discord.js';

export interface send {
  embed: MessageEmbedOptions;
  message: Message;
}
