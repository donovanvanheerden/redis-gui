import { ipcMain as ipc } from 'electron';
import { IRedisClient, RedisClient } from '../core/redisClient';

import * as Messages from '../core/WindowMessages';

interface IMainIpc {
  start: () => void;
}

export class MainIpc implements IMainIpc {
  private redis: IRedisClient;

  public start(): void {
    ipc.on(Messages.CHANNEL_NAME, this._handleIpc.bind(this));
  }

  private async _handleIpc(
    event: Electron.IpcMainEvent,
    arg: unknown
  ): Promise<void> {
    const message = arg as Messages.Message;
    let reply: Messages.Message = null;

    console.log(
      `Main IPC incoming: ${Messages.MessageType[message.type]} => `,
      message
    );

    try {
      switch (message.type) {
        case Messages.MessageType.CREATE_CONNECTION:
          reply = await this._handleCreateConnection(
            <Messages.CreateConnection>message
          );
          break;
        case Messages.MessageType.SWITCH_DB:
          reply = await this._handleSwitchDb(<Messages.SwitchDb>message);
          break;
        case Messages.MessageType.GET_VALUE:
          reply = await this._handleGetStringValue(
            <Messages.GetStringValue>message
          );
          break;
        case Messages.MessageType.SET_STRING_VALUE:
          await this._handleSetStringValue(<Messages.SetStringValue>message);
          break;
        case Messages.MessageType.REMOVE_KEY:
          await this._handleRemoveKey(<Messages.RemoveKey>message);
          break;
        case Messages.MessageType.RENAME_KEY:
          await this._handleRenameKey(<Messages.RenameKey>message);
          break;
        case Messages.MessageType.SET_KEY_EXPIRY:
          await this._handleSetKeyExpiry(<Messages.SetKeyExpiry>message);
          break;
        default:
          break;
      }
    } catch (error) {
      const err: Messages.ErrorMessage = {
        message: error as string,
        type: Messages.MessageType.ERROR,
      };

      reply = err;
    }

    if (reply !== null) {
      event.sender.send(Messages.CHANNEL_NAME, reply);
    }
  }

  private async _handleCreateConnection(
    message: Messages.CreateConnection
  ): Promise<Messages.Message> {
    this.redis = new RedisClient({
      host: message.host,
      port: message.port,
      password: message.password,
    });

    try {
      const response = await this.redis.connect();

      const reply: Messages.Connected = {
        type: Messages.MessageType.CONNECTED,
        ...response,
      };

      return reply;
    } catch (error) {
      this.redis.disconnect();

      console.error('unhandled error: ', error);

      return Promise.reject(
        `Unable to connect to ${message.name} (${message.host}:${message.port}).`
      );
    }
  }

  private async _handleSwitchDb(
    message: Messages.SwitchDb
  ): Promise<Messages.Message> {
    const response = await this.redis.switchDb(message.db.index);

    const reply: Messages.DbSwitched = {
      type: Messages.MessageType.DB_SWITCHED,
      keys: response,
    };

    return reply;
  }

  private async _handleGetStringValue(
    message: Messages.GetStringValue
  ): Promise<Messages.Message> {
    const response = await this.redis.getString(message.key);

    const reply: Messages.GetStringValue = {
      type: Messages.MessageType.GET_VALUE,
      ...message,
      value: response,
    };

    return reply;
  }

  private async _handleSetStringValue(
    message: Messages.SetStringValue
  ): Promise<void> {
    await this.redis.setString(message.key, message.value);
  }

  private async _handleRemoveKey(message: Messages.RemoveKey): Promise<void> {
    await this.redis.removeKeys(...message.keys);
  }

  private async _handleRenameKey(message: Messages.RenameKey): Promise<void> {
    await this.redis.renameKey(message.key, message.newName);
  }

  private async _handleSetKeyExpiry(
    message: Messages.SetKeyExpiry
  ): Promise<void> {
    await this.redis.setKeyExpiry(message.key, message.seconds);
  }
}
