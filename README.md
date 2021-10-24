# SSH-Package

Small package to transfer data with ssh using SFTP.

## Installation

**Using npm**

```shell
$ npm i ssh-package
```

**Using yarn**

```shell
$ yarn add ssh-package
```

## Start connection

```js
import { Client } from "ssh-package";

const connection = new Client({
  host: "hostIp",
  username: "username",
  password: "password",
  port: port, // default = 22
});

connection.on("ready", async () => {
  // do stuff
});
```

## Transfer data

**Download file(s)**

```js
connection.download
  .file(remotePath, localPath)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log("Error: ", err);
  });

// async
try {
  const response = await connection.download.files([
    { remote: remotePath1, local: localPath1 },
    { remote: remotePath2, local: localPath2 },
  ]);
} catch (err) {
  console.log("Error: ", err);
}
```

**Download directory(ies)**

```js
connection.download
  .directory(remotePath, localPath)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log("Error: ", err);
  });

// async
try {
  const response = await connection.download.directories([
    { remote: remotePath1, local: localPath1 },
    { remote: remotePath2, local: localPath2 },
  ]);
} catch (err) {
  console.log("Error: ", err);
}
```

**Upload file(s)**

```js
connection.upload
  .file(localPath, remotePath)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log("Error: ", err);
  });

// async
try {
  const response = await connection.upload.files([
    { remote: remotePath1, local: localPath1 },
    { remote: remotePath2, local: localPath2 },
  ]);
} catch (err) {
  console.log("Error: ", err);
}
```

**Upload directory(ies)**

```js
connection.upload
  .directory(localPath, remotePath)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log("Error: ", err);
  });

// async
try {
  const response = await connection.upload.directories([
    { remote: remotePath1, local: localPath1 },
    { remote: remotePath2, local: localPath2 },
  ]);
} catch (err) {
  console.log("Error: ", err);
}
```

## Execute command

```js
connnection
  .exec("ls -l")
  .then((res) => {
    console.log(res);
  })
  .catch((e) => {
    console.log("Error: ", e);
  });

// async
try {
  const response = await connnection.exec("ls -l", {
    cwd: "/home/user",
    encoding: "utf-8",
  });
} catch (err) {
  console.log("Error: ", err);
}
```

## Create directory

```js
connnection
  .mkdir("/path/to/new/directory")
  .then((res) => {
    console.log(res);
  })
  .catch((e) => {
    console.log("Error: ", e);
  });

// async
try {
  const response = await connection.mkdir("/path/to/new/directory");
} catch (err) {
  console.log("Error: ", err);
}
```
