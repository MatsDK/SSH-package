import path from "path";
import scanDirectory from "sb-scandir";
import { Client, SFTPWrapper } from "ssh2";
import {
  PutDirCB,
  PutDirsCB,
  PutFileCB,
  TransferDirectories,
  TransferDirectoryOptions,
  TransferFileOptions,
  TransferFiles,
} from "../types";
import { getRelativePaths, unixify } from "./helpers";

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

  file = async (
    localPath: string,
    remotePath: string,
    options?: TransferFileOptions | PutFileCB,
    cb?: PutFileCB
  ) =>
    new Promise(async (res, rej) => {
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

      if (!options?.SFTPConn) {
        sftp.end();
        sftp.on("close", () => {
          // console.log("Close");
        });
      }

      if (cb) {
        if (err) return cb(err as string);
        cb(null);
      } else if (err) rej(err);

      res("Success");
    });

  files = async (
    paths: TransferFiles,
    options?: TransferFileOptions | PutFileCB,
    cb?: PutFileCB
  ) =>
    new Promise(async (resolve, rej) => {
      if (typeof options == "function") {
        cb = options;
        options = {};
      }

      const sftp: SFTPWrapper = options?.SFTPConn || (await this.getSFTP()),
        promiseList: Promise<any>[] = [];

      for (const path of paths)
        promiseList.push(
          this.file(unixify(path.local), unixify(path.remote), {
            SFTPConn: sftp,
          })
        );

      await Promise.all(promiseList).catch((e) => {
        if (cb) return cb(e);
        rej(e);
      });

      if (!options?.SFTPConn) {
        sftp.end();
        sftp.on("close", () => {
          // console.log("end");
        });
      }

      if (cb) cb(null);
      resolve("Success");
    });

  directory = async (
    localPath: string,
    remotePath: string,
    options?: TransferDirectoryOptions | PutDirCB,
    cb?: PutDirCB
  ) =>
    new Promise(async (res, rej) => {
      if (typeof options == "function") {
        cb = options;
        options = {};
      }

      const sftp = options?.SFTPConn || (await this.getSFTP()),
        scan = await scanDirectory(unixify(localPath));

      const [files, dirs]: string[][] = [
        getRelativePaths(scan.files, localPath),
        getRelativePaths(scan.directories, localPath),
      ];

      const directories: string[][] = dirs
        .map((_: string) =>
          unixify(_)
            .split("/")
            .filter((_: string) => !!_)
        )
        .sort((a: string[], b: string[]) => a.length - b.length);

      try {
        const promiseList: Promise<any>[] = [];

        directories.forEach((_: string[]) => {
          const dirPath: string = unixify(path.join(remotePath, _.join("/")));

          promiseList.push(
            new Promise((res, rej) => {
              sftp.exists(dirPath, (exists) => {
                if (!exists)
                  sftp.mkdir(dirPath, (err) => {
                    if (err) rej(err);
                    else res("Success");
                  });
                else res("Succes");
              });
            })
          );
        });

        await Promise.all(promiseList);

        await this.files(
          files.map((_: string) => ({
            local: unixify(path.join(localPath, _)),
            remote: unixify(path.join(remotePath, _)),
          })),
          { SFTPConn: sftp }
        );
      } catch (err) {
        if (cb) return cb(err, null);
        rej(err);
      }

      const ret: string = `Uploaded: ${scan.directories.length} diretor${scan.directories.length == 1 ? "y" : "ies"
        }, ${scan.files.length} file${scan.files.length != 1 ? "s" : ""}`;

      if (!options?.SFTPConn) {
        sftp.end();
        sftp.on("close", () => {
          // console.log("Close");
        });
      }

      if (cb) cb(null, ret);
      res(ret);

      return ret;
    });

  directories = async (
    paths: TransferDirectories,
    options?: TransferDirectoryOptions | PutDirsCB,
    cb?: PutDirsCB
  ) =>
    new Promise(async (res, rej) => {
      if (typeof options == "function") {
        cb = options;
        options = {};
      }

      const sftp = options?.SFTPConn || (await this.getSFTP()),
        promiseList: Promise<any>[] = [];

      for (const path of paths)
        promiseList.push(
          this.directory(unixify(path.local), unixify(path.remote), {
            SFTPConn: sftp,
          })
        );

      await Promise.all(promiseList).catch((e) => {
        if (cb) return cb(e);
        rej(e);
      });

      if (!options?.SFTPConn) {
        sftp.end();
        sftp.on("close", () => {
          // console.log("Close");
        });
      }

      if (cb) cb(null);
      res("Succes");
    });
}
