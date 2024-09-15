import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

export const Client = new MailtrapClient({
  endpoint: process.env.MAILTRAP_ENDPOINT,
  token: process.env.MAILTRAP_TOKEN,
  timeout: 30000,
});

export const sender = {
  email: "mailtrap@demomailtrap.com",
  name: "Obayed",
};
