const { Client } = require("whatsapp-web.js");

const client = new Client();


client.on("qr", (qr) => {
  // Generate and scan this code with your phone
  console.log("QR RECEIVED", qr);
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (msg) => {
  console.log(msg);
  console.log(msg.from);
  if (msg.body == "!ping") {
    msg.reply("pong");
    return;
  }
  if (msg.hasMedia){
    console.log("Media is not supported");
    // msg.reply("Media is not supported");
    return;
  }
  if (msg.from.includes("@g")){
    console.log("Group Conversations are not supported");
    // msg.reply("Group Conversations are not supported");
    return;
  }

  const mobile = "+" + msg.from.split('@')[0];
  const message = msg.body;

  if (msg.body == "!new") {
    await fetch("http://localhost:3000/api/new", {
      method: "POST",
      body: JSON.stringify({ mobile }),
    });
    msg.reply("Welcome to PhoneGPT");
    return;
  }


  const response = await fetch("http://localhost:3000/api/response", {
    method: "POST",
    body: JSON.stringify({ mobile, message }),
  });

  const status = response.status;
  const data = await response.json();
  const reply = data?.message;
  console.log("MOBILE: ", mobile, "STATUS: ", status);
  console.log("REPLY: ", reply);

  switch (status){
    case 200:
      msg.reply(reply);
      return;

    case 404:
      return;
    
    case 400:
      return;

    case 500:
      return;

    default:
      return;
  }
});

client.initialize();
