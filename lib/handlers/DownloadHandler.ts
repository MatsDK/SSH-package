import { Client, SFTPWrapper } from "ssh2";
import { GetFileCB, TransferFileOptions, TransferFiles } from "../types";
import { unixify } from "./helpers";

export class DownloadHandler {
  conn: null | Client;

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
    remotePath: string,
    localPath: string,
    options?: TransferFileOptions | GetFileCB,
    cb?: GetFileCB
  ) {
    return new Promise(async (res, rej) => {
      if (typeof options == "function") {
        cb = options;
        options = {};
      }

      const sftp = options?.SFTPConn || (await this.getSFTP());

      const getFile = () =>
        new Promise((res) => {
          sftp.fastGet(unixify(remotePath), unixify(localPath), (err: any) => {
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

  async files(
    paths: TransferFiles,
    options?: TransferFileOptions | GetFileCB,
    cb?: GetFileCB
  ) {
    return new Promise(async (resolve, rej) => {
      if (typeof options == "function") {
        cb = options;
        options = {};
      }

      const sftp: SFTPWrapper = options?.SFTPConn || (await this.getSFTP());
      const promiseList: Promise<any>[] = [];

      for (const path of paths) {
        promiseList.push(
          this.file(unixify(path.remote), unixify(path.local), {
            SFTPConn: sftp,
          })
        );
      }

      await Promise.all(promiseList).catch((e) => {
        if (cb) return cb(e);
        rej(e);
      });

      sftp.end();
      sftp.on("close", () => {
        console.log("close");
      });

      if (cb) cb(null);
      resolve("Success");
    });
  }

  async directory() {}

  async directories() {}
}
