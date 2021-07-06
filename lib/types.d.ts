import { SFTPWrapper } from "ssh2";

export interface ConnectionProps {
  host: string;
  port?: number;
  username: string;
  connect?: boolean;
  password: string;
}

export type connectCB = (err: string | null) => void;
export type GetFileCB = connectCB;
export type PutFileCB = connectCB;
export type GetDirCB = (err: string | null, res: string | null) => void;

export type eventFunction = (...params: any[]) => any;

export interface ExecOptions {
  cwd?: string;
  encoding?: BufferEncoding;
}

export type CommandOuput = { stdout: string[]; stderr: string[] };

export interface TransferFileOptions {
  SFTPConn?: SFTPWrapper;
}

export type TransferFiles = { remote: string; local: string }[];

export interface TransferDirectoryOptions {
  SFTPConn?: SFTPWrapper;
}
