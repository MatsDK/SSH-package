import { Client, SFTPWrapper } from "ssh2";
import unixify from "unixify";
import { GetFileCB } from "../types";

interface TransferFileOptions {
  SFTPConn?: SFTPWrapper;
}

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

      const getFile = () => {
        return new Promise((res) => {
          sftp.fastGet(unixify(remotePath), unixify(localPath), (err) => {
            if (err) return res(err);

            res(false);
          });
        });
      };

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
  files = () => {
    console.log("download files");
  };
  directory = () => {
    console.log("download directory");
  };
  directories = () => {
    console.log("download diretories");
  };
}
