export interface ConnectionProps {
  host: string;
  port?: number;
  username: string;
  connect?: boolean;
  password: string;
}

export type connectCB = (err: string | null) => void;

export type eventFunction = (...params: any[]) => any;
