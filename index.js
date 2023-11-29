import { z } from "zod";

const { Client } = require("whatsapp-web.js");

const client = new Client();

const ChatResponseRequestBody = z.object({
  mobile: z.string().min(5).max(15),
  message: z.string().min(1),
});

client.on("qr", (qr) => {
  // Generate and scan this code with your phone
  console.log("QR RECEIVED", qr);
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (msg) => {
  console.log(msg);
  if (msg.body == "!ping") {
    msg.reply("pong");
    return;
  }

  const mobile = msg.from;
  const message = msg.body;

  const response = await fetch("http://localhost:3000/api/response", {
    method: "POST",
    body: JSON.stringify({ mobile, message }),
  });

  const status = response?.status;
  const reply = response?.message;

  if (status === 200) {
    msg.reply(reply);
    return;
  }

  if (status === 404){
    return;
  }

  if (status === 400){
    msg.reply(" You have used up all your free messages. Please get an add-on.")
    return;
  }

  if (status === 500){
    msg.reply("Something went wrong. Please try again later.")
    return;
  }
  // SEND MESSAGE AND PHONE NUMBER TO BACKEND AND GET RESPONSE AND REPLY
});

client.initialize();
