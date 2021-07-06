import { Client } from "./index";
const PATH = __dirname + "/test/";

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
  //     console.log("Error: ", err);
  //   });

  // try {
  //   const res = await conn.download.file(
  //     "/home/mats/test1.txt",
  //     PATH + "test.txt"
  //   );

  //   console.log(res);
  // } catch (error) {
  //   console.log("Error: ", error);
  // }

  // try {
  //   const res = await conn.upload.file(
  //     PATH + "test.txt",
  //     "/home/mats/tests/fjdslk.txt"
  //   );

  //   console.log(res);
  // } catch (error) {
  //   console.log("Error: ", error);
  // }

  // conn.upload
  //   .file(PATH + "test.txt", "/home/mats/tests/fjdslk.txt")
  //   .then((res) => {
  //     console.log(res);
  //   })
  //   .catch((err) => {
  //     console.log("Error: ", err);
  //   });

  // try {
  //   const res = await conn.download.files([
  //     { remote: "/home/mats/tests/test1.txt", local: PATH + "test1.txt" },
  //     { remote: "/home/mats/tests/test1.txt", local: PATH + "test2.txt" },
  //   ]);

  //   console.log(res);
  // } catch (err) {
  //   console.log("Error: ", err);
  // }

  try {
    const res = await conn.upload.files([
      { remote: "/home/mats/tests/test11.txt", local: PATH + "test1.txt" },
      { remote: "/home/mats/tests/test21.txt", local: PATH + "test2.txt" },
    ]);

    console.log(res);
  } catch (err) {
    console.log("Error: ", err);
  }
});

conn.on("timeout", () => {
  console.log("connection timed out");
});
