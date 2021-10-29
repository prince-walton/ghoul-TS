import { Bot } from '../client/Client';
import { RunFunction } from '../interfaces/Client/IEvent';

export const run: RunFunction = (client: Bot): any => {
  client.logger.info(`[INFO] Загрузка закончилась, вхожу в систему...`);
  client.logger.info(`[INFO] Авторизирован! ${client.user.tag} [${client.user.id}]`);
  client.logger.success('[DONE] Готов к работе.');
};

export const name = 'ready';
