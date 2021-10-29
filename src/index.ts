import { Intents, LimitedCollection, Collection } from 'discord.js';
import { Bot } from './client/Client';

new Bot(
  {
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      Intents.FLAGS.GUILD_VOICE_STATES,
      Intents.FLAGS.GUILDS,
    ],
    makeCache: (manager: any) => {
      if (manager.name === 'MessageManager') return new LimitedCollection({ maxSize: 0 });
      return new Collection();
    },
  },
  { devs: ['761997174476111894'], database: true, ready: true },
);
