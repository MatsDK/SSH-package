import path from "path";
import { Client, SFTPWrapper } from "ssh2";

export const unixify = (path: string): string => path.split("\\").join("/");

export const getRelativePaths = (
  paths: string[],
  relativePath: string
): string[] => paths.map((_: string) => path.relative(relativePath, _));

export const getSFTP = (conn: Client): Promise<SFTPWrapper> =>
  new Promise((res, rej) => {
    conn.sftp((err, sftp) => {
      if (err) return rej(err);
      res(sftp);
    });
  });
