import { Message, Collection, MessageEmbed, Permissions, ColorResolvable, Role, GuildMember } from 'discord.js';
import { Command } from '../interfaces/CLient/ICommand';
import { ms } from 'ms';
import { Bot } from '../client/Client';
import { RunFunction } from '../interfaces/Client/IEvent';
const cooldowns: Collection<string, Collection<string, number>> = new Collection();

export const run: RunFunction = (client: Bot, message: Message): any => {
  if (message.author.bot || !message.guild || !message.content.startsWith('!')) return;

  const argum: string[] = message.content.slice('!'.length).split(/ +/);
  const commandName: string = argum.shift().toLowerCase();

  const command: Command =
    client.commands.get(commandName) ||
    client.commands.find((cmd: Command) => cmd.aliases && cmd.aliases.includes(commandName));
  if (!command) return;

  message.delete();

  if (command.devs && command.devs == true && !client.isDev(message.author)) {
    client.send({
      message: message,
      embeds: [
        client.newEmbed({
          embed: {
            description: 'Эта команда только для разработчиков!',
          },
          message: message,
        }),
      ],
    });
    return;
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now: number = Date.now();
  const timestamps: Collection<string, number> = cooldowns.get(command.name);
  const cooldownAmount: number = (command.cooldown || 5) * 1000;

  if (timestamps.has(message.author.id)) {
    const expTime: number = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expTime) {
      const timeLeft: string = ms(expTime - now);

      client.send({
        message: message,
        embeds: [
          client.newEmbed({
            embed: {
              description: `Пожалуйста, подождите \`${timeLeft}\` перед использованием команды!`,
            },
            message: message,
          }),
        ],
      });
      return;
    }
  } else {
    if (!client.isDev(message.author)) {
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }
  }

  const requiredArguments: [string, any][] = Object.entries(command.argum || {});

  const types: Object = {
    string: /.*/g,
    spaceString: /.*/g,
    number: /\d+/g,
    float: /\d+(?:.|,)\d+/g,
    date: /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g,
    time: /\d+(?:d|h|m|s)/g,
    timestamp: /^(?:2[0-3]|1\d|0?\d|):(?:[0-5]?\d)(?::(?:[0-5]?\d))?$/g,
    user: /(?:(\d{18}))|(?:<@!?(\d{18})>)/g,
    channel: /(?:(\d{18}))|(?:<#?(\d{18})>)/g,
    role: /(?:(\d{18}))|(?:<@&(\d{18})>)/g,
  };

  const notValidType: [string, any][] = requiredArguments.filter(
    (arg: [string, any], i: number) => !types[arg[1].type],
  );

  if (notValidType.length != 0) return client.logger.error(new Error(`Не распознанный тип! ${notValidType}`));

  const typesDescription: Object = {
    string: 'Текст' as string,
    spaceString: 'Текст с пробелами' as string,
    number: 'Число' as string,
    float: 'Дробное число' as string,
    date: `Дата (${new Date().getFullYear()}/${new Date().getMonth()}/${new Date().getDay()})` as string,
    time: 'Длительность (10d, 5m, 2h, 30s)' as string,
    timestamp: 'Время (12:00, 9:30:20)' as string,
    user: 'Пользователь' as string,
    channel: 'Канал' as string,
    role: 'Роль' as string,
  };

  const invalidArguments = (invalidIndex: number = -1) => {
    const arggg: [string, any][] = Object.entries(command.argum);

    let arrowIndex: number = command.name.length + 1;
    const argsStrings: string[] = arggg.map((arg: [string, any], i: number) => {
      if (+i < +invalidIndex) {
        arrowIndex += arg[0].length + 3;
      }
      return `${arg[1].required ? '[' : '('}${arg[0]}${arg[1].required ? ']' : ')'}`;
    });

    const argsDescriptions = arggg.map(
      (arg: [string, any], i: number) =>
        `${i === +invalidIndex ? '__' : ''}\`${arg[0]}\`${i === +invalidIndex ? '__' : ''}**:** **${
          arg[1].description || typesDescription[arg[1].type]
        }${arg[1].required === true ? ' [обязательно]' : ''}**`,
    );

    client.send({
      message: message,
      embeds: [
        client.newEmbed({
          embed: {
            title: "'**📛 ➟ Ошибка команды**'",
            description: `**Используйте:**\n\`/${command.name} ${argsStrings.join(
              ' ',
            )}\n\n\`**Аргументы:**\n${argsDescriptions.join('\n')}`,
          },
          message: message,
        }),
      ],
    });
  };

  for (let i: number = 0; i != requiredArguments.length; i++) {
    const arga: any = requiredArguments[i][1];
    if (!argum[i] && arga.required) return invalidArguments(i);
    const regex: any = types[arga.type];
    if (argum[i] && !argum[i].match(regex)) return invalidArguments(i);
  }

  command
    .run(client, message, argum)
    .catch(error => client.logger.error(new Error(`[ERROR] ${command.name}: ${error}`)));

  client.logger.success(`[DONE] (${message.guild.name}) ${message.author.tag}: !${command.name}`);
};

export const name = 'messageCreate';
