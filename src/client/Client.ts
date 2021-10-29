import { Client, ClientOptions, MessageEmbed, Collection, User, GuildMember } from 'discord.js';
import consola, { Consola } from 'consola';
import { send as SendConfig } from '../interfaces/Client/ISend';
import { send as EmbedConfig } from '../interfaces/Client/IEmbed';
import { Glob } from 'glob';
import { promisify } from 'util';
import { Event } from '../interfaces/Client/IEvent';
import { Command } from '../interfaces/Client/ICommand';
import { Config } from '../interfaces/Client/IConfig';
import { ClientSettings } from '../interfaces/Client/ISettings';
import { config as DotEnvConfig } from 'dotenv';
import { connect as MongoConnect, ConnectOptions } from 'mongoose';
DotEnvConfig();

const globPromise: Function = promisify(Glob);

export class Bot extends Client {
  public logger: Consola = consola;
  public events: Collection<string, Event> = new Collection();
  public commands: Collection<string, Command> = new Collection();
  public config: Config;
  public devs: Array<string>;
  public languages: Array<string> = ['TypeScript', 'JavaScript'];

  constructor(options: ClientOptions, settings?: ClientSettings) {
    super(options);

    this.devs = settings.devs;

    if (settings.ready == true) {
      this.start({ token: process.env.TOKEN, DBToken: process.env.DB_URL });
    }

    if (settings.database == true) {
      this.base({ token: process.env.TOKEN, DBToken: process.env.DB_URL });
    }
  }

  public async isDev(user: User | GuildMember): Promise<boolean> {
    return this.devs.includes(user.id);
  }

  public async start(config: Config): Promise<void> {
    this.logger.info(`[INFO] Загрузка началась!`);

    this.config = config;
    super.login(config.token);

    const commandFiles: string[] = await globPromise(`${__dirname}/../commands/**/*{.ts,.js}`);
    commandFiles.map(async (value: string) => {
      const file: Command = await import(value);
      this.logger.info(`[INFO] Команда ${file.name} загружена!`);
      this.commands.set(file.name, file);
    });

    const eventFiles: string[] = await globPromise(`${__dirname}/../events/**/*{.ts,.js}`);
    eventFiles.map(async (value: string) => {
      const file: Event = await import(value);
      this.logger.info(`[INFO] Эвент ${file.name} загружен!`);
      this.events.set(file.name, file);

      this.on(file.name, file.run.bind(null, this));
    });
  }

  public async base(config: Config) {
    MongoConnect(config.DBToken, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions)
      .then(() => this.logger.success('[DONE] База Данных подключена!'))
      .catch(e => this.logger.error(new Error(e)));
  }

  public async send(options: SendConfig): Promise<void> {
    if (options.embeds && options.embeds != null && (!options.content || options.content == null)) {
      options.message.channel.send({ embeds: options.embeds });
    } else if (options.content && options.content != null && (!options.embeds || options.embeds == null)) {
      options.message.channel.send({ content: options.content });
    } else if (options.content && options.content != null && options.embeds && options.embeds != null) {
      options.message.channel.send({ content: options.content, embeds: options.embeds });
    } else {
      this.logger.error(new Error('Please, select "content" or "embeds" in options.'));
    }
  }

  public newEmbed(options: EmbedConfig): MessageEmbed {
    return new MessageEmbed({ ...options.embed }).setFooter(
      `${options.message.author.tag} | ${this.user.username}`,
      options.message.author.displayAvatarURL({ format: 'png', dynamic: true }),
    );
  }
}