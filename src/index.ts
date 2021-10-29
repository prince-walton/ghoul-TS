import { Client, Intents, Collection, LimitedCollection } from 'discord.js';
import { config as DotEnvConfig } from "dotenv";
DotEnvConfig();

const client = new Client(
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
);

client.login(process.env.TOKEN);