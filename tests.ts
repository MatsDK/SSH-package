import { Client } from "./lib";

const conn = new Client(
  {
    host: "192.168.0.227",
    username: "mats",
    password: "mats",
    //     connect: false,
  }
  //   (err) => {
  //     if (err) throw err;
  //     console.log("Ready");
  //   }
);

// conn.connect((err) => {
//   if (err) throw err;
//   console.log("Ready");
// });

conn.on("ready", () => {
  console.log("ready");
  conn.download.files();
});

// console.log(conn);
