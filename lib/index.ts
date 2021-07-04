import { Client as SSH2Client } from "ssh2";
import { connectCB, ConnectionProps, eventFunction } from "./types";

class Client {
  connectionProps: ConnectionProps;
  #conn: SSH2Client;
  #connecting: boolean;
  connected: boolean;
  #events: Map<string, eventFunction>;

  constructor(
    { port = 22, connect = true, ...connectionProps }: ConnectionProps,
    cb?: connectCB
  ) {
    this.#events = new Map();
    this.#connecting = false;
    this.connected = false;

    this.#conn = new SSH2Client();
    this.connectionProps = {
      ...connectionProps,
      port,
    };

    if (connect) this.connect(cb);
  }

  connect(cb?: connectCB) {
    if (this.#connecting) return;

    this.#connecting = true;

    this.#conn.connect(this.connectionProps);

    this.#conn.on("timeout", () => {
      if (cb) cb("timeout");
      this.#connecting = false;
    });

    this.#conn.on("error", (err) => {
      if (cb) cb(err as string);
      this.#connecting = false;
    });

    this.#conn.on("ready", () => {
      if (cb) cb(null);

      this.#triggerEvent("ready");
      this.connected = true;
    });
  }

  on(eventName: string, func: eventFunction): any {
    this.#events.set(eventName, func);
  }

  #triggerEvent(eventName: string, ...params: any[]) {
    const thisEvent = this.#events.get(eventName);

    if (thisEvent) thisEvent(...params);
  }

  upload = {
    file: () => {
      console.log("upload file");
    },
    files: () => {
      console.log("upload files");
    },
    directory: () => {
      console.log("upload directory");
    },
    directories: () => {
      console.log("upload diretories");
    },
  };

  download = {
    file: () => {
      console.log("download file");
    },
    files: () => {
      console.log("download files");
    },
    directory: () => {
      console.log("download directory");
    },
    directories: () => {
      console.log("download diretories");
    },
  };
}

export { Client };
// export default { Client };
