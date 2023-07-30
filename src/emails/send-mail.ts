import sgMail from "@sendgrid/mail";

export const sendMail = async (email: string, token: string) => {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY not set");
  }
  if (!process.env.MAIL_FROM_ADDRESS) {
    throw new Error("MAIL_FROM_ADDRESS not set");
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: email,
    from: process.env.MAIL_FROM_ADDRESS!,
    subject: "Verify your email",
    text: `Hi, you have requested to add your name pronunciation to our database. Please click the link below to verify your email.\n\n${process.env.NEXT_PUBLIC_URL}/verify/${token}`,
  };
  sgMail
    .send(msg)
    .then((response) => {
      console.log(
        `[MAILS] Sent mail to:${email} with token:${token} succesfully!`
      );
    })
    .catch((error) => {
      console.error(`
        [MAILS] Error sending mail to:${email} with token:${token}, error:${error}`);
    });
};
