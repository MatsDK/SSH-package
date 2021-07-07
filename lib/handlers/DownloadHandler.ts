import { Client, SFTPWrapper } from "ssh2";
import scanDirectory from "sb-scandir";
import path from "path";
import fs from "fs";
import {
  GetDirCB,
  GetDirsCB,
  GetFileCB,
  TransferDirectories,
  TransferDirectoryOptions,
  TransferFileOptions,
  TransferFiles,
} from "../types";
import { getRelativePaths, unixify } from "./helpers";

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

      if (!options?.SFTPConn) {
        sftp.end();
        sftp.on("close", () => {
          console.log("close");
        });
      }

      if (cb) {
        if (err) return cb(err as string);
        cb(null);
      } else if (err) rej(err);

      res("Success");
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

      for (const path of paths)
        promiseList.push(
          this.file(unixify(path.remote), unixify(path.local), {
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
          console.log("close");
        });
      }

      if (cb) cb(null);
      resolve("Success");
    });
  }

  directory = async (
    remotePath: string,
    localPath: string,
    options?: TransferDirectoryOptions | GetDirCB,
    cb?: GetDirCB
  ) =>
    new Promise(async (res, rej) => {
      if (typeof options == "function") {
        cb = options;
        options = {};
      }

      const sftp: SFTPWrapper = options?.SFTPConn || (await this.getSFTP()),
        scan = await scanDirectory(remotePath, {
          fileSystem: {
            basename: (file_path) => path.posix.basename(file_path),
            join: (file_path1, file_path2) =>
              path.posix.join(file_path1, file_path2),
            readdir: (path) =>
              new Promise((resolve, rej) => {
                sftp.readdir(path, (err, res) => {
                  if (err) rej(err);
                  else resolve(res.map((item) => item.filename));
                });
              }),
            stat: (path) =>
              new Promise((resolve, rej) => {
                sftp.stat(path, (err, res) => {
                  if (err) rej(err);
                  else resolve(res as any);
                });
              }),
          },
        });

      const [files, dirs]: string[][] = [
        getRelativePaths(scan.files, remotePath),
        getRelativePaths(scan.directories, remotePath),
      ];

      const directories: string[][] = dirs
        .map((_: string) =>
          unixify(_)
            .split("/")
            .filter((_: string) => !!_)
        )
        .sort((a: string[], b: string[]) => a.length - b.length);

      try {
        directories.forEach((_) => {
          const thisPath = path.join(localPath, _.join("/"));

          if (!fs.existsSync(thisPath)) fs.mkdirSync(thisPath);
        });

        await this.files(
          files.map((_: string) => ({
            local: unixify(path.join(localPath, _)),
            remote: unixify(path.join(remotePath, _)),
          })),
          { SFTPConn: sftp }
        );
      } catch (e) {
        if (cb) return cb(e, null);
        rej(e);
      }

      const ret: string = `Downloaded: ${scan.directories.length} diretor${
        scan.directories.length == 1 ? "y" : "ies"
      }, ${scan.files.length} file${scan.files.length != 1 ? "s" : ""}`;

      if (!options?.SFTPConn) {
        sftp.end();
        sftp.on("close", () => {
          console.log("Close");
        });
      }

      if (cb) cb(null, ret);
      res(ret);

      return ret;
    });

  directories = async (
    paths: TransferDirectories,
    options?: TransferDirectoryOptions | GetDirsCB,
    cb?: GetDirsCB
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
          this.directory(unixify(path.remote), unixify(path.local), {
            SFTPConn: sftp,
          })
        );

      await Promise.all(promiseList).catch((e) => {
        if (cb) return cb(e);
        rej(e);
      });

      if (options?.SFTPConn) {
        sftp.end();
        sftp.on("close", () => {
          console.log("Close");
        });
      }

      if (cb) cb(null);
      res("Success");
    });
}
