import path from "path";
export const unixify = (path: string): string => path.split("\\").join("/");

export const getRelativePaths = (
  paths: string[],
  relativePath: string
): string[] => paths.map((_: string) => path.relative(relativePath, _));
