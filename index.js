const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");

var http = require("http");

//create a server object:
http
  .createServer(function (req, res) {
    res.write("Hello World!"); //write a response to the client
    res.end(); //end the response
  })
  .listen(10000); //the server object listens on port 8080

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    handleSIGINT: false,
  },
});

process.on("SIGINT", async () => {
  console.log("(SIGINT) Shutting down...");
  await client.destroy();
  console.log("client destroyed");
  process.exit(0);
});

client.on("qr", (qr) => {
  // Generate and scan this code with your phone
  console.log("QR RECEIVED", qr);
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (msg) => {
  if (msg.body == "!ping") {
    msg.reply("pong");
    return;
  }

  const mobile = "+" + msg.from.split("@")[0];
  const message = msg.body;

  console.log("MOBILE: ", mobile, "MESSAGE :", message);
  if (msg.hasMedia) {
    console.log("Media is not supported");
    // msg.reply("Media is not supported");
    return;
  }
  if (msg.from.includes("@g")) {
    console.log("Group Conversations are not supported");
    // msg.reply("Group Conversations are not supported");
    return;
  }

  if (msg.body == "!new") {
    await fetch("https://chatwiz.onrender.com/api/new", {
      method: "POST",
      body: JSON.stringify({ mobile }),
    });
    msg.reply("Welcome to PhoneGPT");
    return;
  }

  try {
    const response = await fetch("https://chatwiz.onrender.com/api/response", {
      method: "POST",
      body: JSON.stringify({ mobile, message }),
    });

    const status = response.status;
    const data = await response.json();
    const reply = data?.message;
    console.log("MOBILE: ", mobile, "STATUS: ", status, "REPLY: ", reply);

    switch (status) {
      case 200:
        msg.reply(reply);
        return;

      // case 404:
      //   return;

      // case 400:
      //   return;

      // case 500:
      //   return;

      default:
        return;
    }
  } catch (err) {
    console.log(err);
    const reply = "Something went wrong. Please try again later.";
    msg.reply(reply);
    return;
  }
});

client.initialize();
