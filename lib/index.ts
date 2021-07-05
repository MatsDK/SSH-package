import { Client as SSH2Client } from "ssh2";
import { DownloadHandler } from "./handlers/DownloadHandler";
import { UploadHandler } from "./handlers/UploadHandler";
import {
  CommandOuput,
  connectCB,
  ConnectionProps,
  eventFunction,
  ExecOptions,
} from "./types";
type execCB = (err: string | null, res: string | null) => void;

class Client {
  connectionProps: ConnectionProps;
  connected: boolean;

  #conn: SSH2Client;
  #connecting: boolean;
  #events: Map<string, eventFunction>;

  download: DownloadHandler;
  upload: UploadHandler;

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

    this.download = new DownloadHandler();
    this.upload = new UploadHandler();

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

    const ready = () => {
      if (cb) cb(null);

      this.download.setConn(this.#conn);
      this.upload.setConn(this.#conn);

      this.connected = true;
      this.#triggerEvent("ready");

      clearTimeout(timeout);
    };

    this.#conn.on("ready", ready);

    const timeout = setTimeout(() => {
      if (!this.connected) {
        if (cb) cb("connection timed out");

        this.#connecting = false;
        this.#triggerEvent("timeout");
      }
      this.#conn.removeListener("ready", ready);
    }, 5000);
  }

  on(eventName: string, func: eventFunction): any {
    this.#events.set(eventName, func);
  }

  #triggerEvent(eventName: string, ...params: any[]) {
    const thisEvent = this.#events.get(eventName);

    if (thisEvent) thisEvent(...params);
  }

  #command(command: string, options?: ExecOptions) {
    const output: CommandOuput = { stdout: [], stderr: [] };

    return new Promise((res, rej) => {
      if (!this.connected) {
        if (this.#connecting) return rej("Connetion not ready");
        return rej("No connection found");
      }

      this.#conn.exec(command, (err, stream) => {
        if (err) return rej(err);

        stream.on("data", (chunk: Buffer) => {
          output.stdout.push(chunk.toString(options?.encoding));
        });

        stream.stderr.on("data", (err: Buffer) => {
          output.stderr.push(err.toString(options?.encoding));
        });

        stream.end();
        stream.on("close", () => {
          res({
            stdout: output.stdout.join("").trim(),
            stderr: output.stderr.join("").trim(),
          });
        });
      });
    });
  }

  async exec(command: string, options?: ExecOptions | execCB, cb?: execCB) {
    if (typeof options == "function") {
      cb = options;
      options = {};
    }

    if (options?.cwd) command = `cd ${options.cwd} && ${command}`;

    const res: any = await this.#command(command, options);

    if (cb) {
      if (res.stderr) cb(res.stderr, null);
      else cb(null, res.stdout);
    } else if (res.stderr) throw res.stderr;

    return res.stdout;
  }
}

export { Client };
