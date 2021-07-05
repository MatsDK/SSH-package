import { Client, SFTPWrapper } from "ssh2";
import unixify from "unixify";
import { GetFileCB, PutFileCB, TransferFileOptions } from "../types";

export class UploadHandler {
  conn: Client | null;

  constructor() {
    this.conn = null;
  }

  setConn(conn: Client) {
    this.conn = conn;
  }

  async getSFTP(): Promise<SFTPWrapper> {
    return new Promise((resolve, reject) => {
      if (!this.conn) return reject("Connection not found");

      this.conn.sftp((err, res) => {
        if (err) return reject(err);

        resolve(res);
      });
    });
  }

  async file(
    localPath: string,
    remotePath: string,
    options?: TransferFileOptions | PutFileCB,
    cb?: PutFileCB
  ) {
    return new Promise(async (res, rej) => {
      if (typeof options == "function") {
        cb = options;
        options = {};
      }

      const sftp: SFTPWrapper = options?.SFTPConn || (await this.getSFTP());

      const getFile = () =>
        new Promise((res) => {
          sftp.fastPut(unixify(localPath), unixify(remotePath), (err) => {
            if (err) return res(err);

            res(false);
          });
        });

      const err = await getFile();

      sftp.end();
      sftp.on("close", () => {
        if (cb) {
          if (err) return cb(err as string);
          cb(null);
        } else if (err) rej(err);

        res("Success");
      });
    });
  }

  async files() {}

  async directory() {}

  async directories() {}
}
