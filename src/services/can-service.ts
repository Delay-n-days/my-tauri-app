import { invoke } from "@tauri-apps/api/core";

export interface CanMessage {
  id: number;
  data: number[];
  timestamp: number;
}

export class CanService {
  async init(channel: number, baudrate: number): Promise<string> {
    return await invoke<string>("can_init", { channel, baudrate });
  }

  async send(id: number, data: number[]): Promise<string> {
    return await invoke<string>("can_send", { id, data });
  }

  async receive(timeoutMs: number): Promise<CanMessage[]> {
    return await invoke<CanMessage[]>("can_receive", { timeoutMs });
  }

  async close(): Promise<string> {
    return await invoke<string>("can_close");
  }
}
