import { RunFunction } from '../../interfaces/Client/ICommand';

export const category: string = 'General Commands';
export const cooldown: number = 10;
export const description: string = 'Показывает информацию о приложении';
export const slash: boolean = false;

export const run: RunFunction = async (client, message, args): Promise<void> => {
  const usedMemory: number = Math.floor(process.memoryUsage().heapUsed / 1024 / 1024);
  const owners: string = client.devs.map((developer: string) => `<@${developer}>`).join(', ');
  const languages: string = client.languages.map((language: string) => language).join(', ');

  client.send({
    embeds: [
      client.newEmbed({
        embed: {
          color: "AQUA",
          title: `Информация о приложении`,
          description: `**Нагрузка на приложение: \`${usedMemory.toString()} MB\`\nСоздатели приложения: ${owners}\nЯзык приложения: \`${languages}\`**`,
        },
        message: message,
      }),
    ],
    message: message,
  });
};

export const name: string = 'info';