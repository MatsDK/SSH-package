import { Client } from "./lib";

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

  try {
    const res = await conn.exec("tree", { cwd: "" });

    console.log(res);
  } catch (e) {
    console.log("error: ", e);
  }
});

// console.log(conn);
