const emailTemplate = (url: string, name: string, email: string) => {
  return `
  <!DOCTYPE html>
  <html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">

  <head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta content="telephone=no" name="format-detection">
    <title></title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
  
      .email-container {
        width: 100%;
        max-width: 576px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 32px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
  
      .header {
        display: flex;
        justify-content: center;
      }
  
      .header img {
        width: 45%;
        padding: 24px;
      }
  
      .content {
        font-size: 15px;
        padding: 32px 24px 32px 24px;
        text-align: start;
      }
  
      .verification-code {
        font-size: 36px;
        font-weight: bold;
        letter-spacing: 10px;
        margin: 20px 0;
        color: #7F56D9;
      }
  
      .button {
        background-color: #7F56D9;
        color: #ffffff;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        display: inline-block;
        margin: 20px 0;
      }
  
      .footer {
        font-size: 15px;
        color: #888888;
        text-align: start;
        padding: 32px 24px 32px 24px;
      }
  
      .footer a {
        color: #7F56D9;
        text-decoration: none;
      }

      @media (prefers-color-scheme: dark) {
        body {
          background-color: #121212;
          color: #ffffff;
        }
  
        .email-container {
          background-color: #1e1e1e;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
        }
  
        .verification-code {
          color: #bb86fc;
        }
  
        .button {
          background-color: #bb86fc;
        }
  
        .footer {
          color: #bbbbbb;
        }
  
        .footer a {
          color: #bb86fc;
        }
      }
    </style>
  </head>
  
  <body class="body">
    <div dir="ltr" class="es-wrapper-color">
      <table cellpadding="0" cellspacing="0" class="email-container">
        <tr>
          <td class="header">
            <img alt="Untitled UI"
              src="https://firebasestorage.googleapis.com/v0/b/ikart-40b39.appspot.com/o/images%2Fstatic-images%2Fvertical-logo.png?alt=media&token=c25c4b6b-e3db-4aa5-adf6-724b5e72f0fe">
          </td>
        </tr>
        <tr>
          <td esd-text="true" class="content esd-text" style="padding: 0 24px">
            <h3>Welcome to Shallbuy!</h3>
            <p style="margin-top: 24px">Hi ${name},</p>
            <p style="margin-top: 24px">Welcome to Shallbuy, your one-stop destination for all your shopping needs! We are
              thrilled to have you on board and look forward to providing you with an exceptional online shopping
              experience.</p>
            <p style="margin-top: 24px">This is your verification code:</p>
            <p class="verification-code" style="margin-top: 24px">3066</p>
            <p style="margin-top: 24px">This code will only be valid for the next 24 hours.</p>
            <a href="${url}" class="button" style="margin-top: 24px; text-decoration: none; color: #ffffff;">Verify email</a>
            <p style="margin-top: 24px">Thanks,<br>The team</p>
          </td>
        </tr>
        <tr>
          <td esd-text="true" class="footer esd-text" style="padding: 24px;">
            <p>This email was sent to <a href="mailto:${email}">${email}</a>. If you'd rather
              not receive this kind of email, you can <a href="#">unsubscribe</a> or <a href="#">manage your email
                preferences</a>.</p>
                <p style="font-size: 12px; color: #888888; margin-top: 14px;">© 2024 Shallbuy, Coimbatore, Tamil Nadu, India</p>
          </td>
        </tr>
      </table>
    </div>
  </body>
  
  </html>
`;
};

export default emailTemplate;
