import { Client } from "./index";

const conn = new Client(
  {
    host: "192.168.0.227",
    username: "mats",
    password: "mats",
    connect: false,
  }
  //   (err) => {
  //     if (err) throw err;
  //     console.log("Ready");
  //   }
);

conn.connect();

conn.on("ready", async () => {
  console.log("ready");

  // conn
  //   .exec("tree -J")
  //   .then((res) => {
  //     console.log(res);
  //   })
  //   .catch((e) => {
  //     console.log("Error: ", e);
  //   });

  // try {
  //   const res = await conn.exec("ls -l", {
  //     cwd: "/home/mats",
  //     encoding: "utf-8",
  //   });

  //   console.log(res);
  // } catch (e) {
  //   console.log("Error: ", e);
  // }

  // conn.download
  //   .file("/home/mats/test.txt", __dirname + "/x.txt")
  //   .then((res) => {
  //     console.log(res);
  //   })
  //   .catch((err) => {
  //     console.log("error: ", err);
  //   });

  try {
    const res = await conn.download.file(
      "/home/mats/test.txt",
      __dirname + "/x.txt"
    );

    console.log(res);
  } catch (error) {
    console.log("Error: ", error);
  }
});

conn.on("timeout", () => {
  console.log("connection timed out");
});
