import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplate.js";
import { Client, sender } from "./mailtrap.confiq.js";

export const verificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];

  try {
    const response = await Client.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
      timeout: 30000,
    });
    console.log("Email sent successfully", response);
  } catch (error) {
    console.error(`Error sending email verification`, error);
    throw new Error(error);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];
  try {
    const response = await Client.send({
      from: sender,
      to: recipient,
      template_uuid: "e9f36d41-4772-46a0-8816-63e01046f2c4",
      template_variables: {
        company_info_name: "obayed company",
        name: name,
      },
    });
    console.log("Welcome email sent successfully", response);
  } catch (error) {
    console.error(`Error sending email verification`, error);

    throw new Error(`Error sending email: ${error}`);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  const recipient = [{ email }];

  try {
    const response = await Client.send({
      from: sender,
      to: recipient,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Password Reset",
    });
  } catch (error) {
    console.error(`Error sending password reset`, error);
    throw new Error(`Error sending password reset email: ${error}`);
  }
};

export const sendResetSuccessEmail = async (email) => {
  const recipient = [{ email }];

  try {
    const response = await Client.send({
      from: sender,
      to: recipient,
      subject: "Reset your password successfull",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });
    console.log("Password email sent successfully", response);
  } catch (error) {
    console.error(`Error sending password reset successfull`, error);
    throw new Error(`Error sending password reset email success: ${error}`);
  }
};
