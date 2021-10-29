import { Message, MessageEmbed } from 'discord.js';

export interface send {
  message: Message;
  content?: string | null;
  embeds?: Array<MessageEmbed> | null;
}
