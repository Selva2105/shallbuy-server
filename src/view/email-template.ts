const emailTemplate = (url: string, name: string) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap" rel="stylesheet">
    <title>Verify email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
  
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            margin-top: 20px;
        }
  
        img {
            max-width: 100%;
            height: auto;
            margin-bottom: 20px;
        }
  
        h1 {
            color: #333333;
        }
  
        p {
            color: #666666;
            line-height: 1.6;
        }
  
        .button {
            display: inline-block;
            padding: 5px;
            font-size: 16px;
            text-align: center;
            text-decoration: none;
            color:  #3498db;
            border-radius: 5px;
            cursor: pointer;
              
        }
          
        .link{
            margin-left:40%;
        }
          
        .link-p{
            font-size: 14px;
        }
        
        .poppins-medium {
            font-family: "Poppins", sans-serif;
            font-weight: 500;
            font-style: normal;
        }

        .poppins-regular {
            font-family: "Poppins", sans-serif;
            font-weight: 400;
            font-style: normal;
        }

        .logo-img{
            width: 20%;
        }
          
        .img-container{
            display: flex;
            align-items: center;
        }
          
        .img-font{  
            font-size: 22px;    
        }

      </style>
    </head>
    <body>
        <div class="container poppins-regular">
            <div class="img-container">
                <img src="https://ecom-server-beta.vercel.app/images/logo.png" alt="Company Logo" class="logo-img">
            </div>
            <p class="poppins-medium">Hi ${name} our beloved Chief,</p>
            <p>Welcome to Shallbuy, your one-stop destination for all your shopping needs! We are thrilled to have you on board and look forward to providing you with an exceptional online shopping experience.</p>
            <p>To ensure the security of your account, we kindly ask you to verify your email address. Simply click on the following link to complete the verification process:
            </p>
                <div class="link">
                    <a href="${url}" class="button" target="_blank">Click to verify</a>
                </div>
          
            <p>By verifying your email, you'll gain access to exclusive offers, personalized recommendations, and the latest updates on our newest arrivals. We want to make sure you don't miss out on any exciting news or promotions!</p>

            <p>If you have any questions or need assistance, our customer support team is here to help. Feel free to reach out to [support@shallbuy.com] for prompt assistance.</p>
          
            <p>Thank you for choosing Shallbuy. We can't wait to embark on this shopping journey with you!.</p>
            <p>Best Regards,<br>The Shallbuy Team</p>
        </div>
    </body>
</html>
`;
};

export default emailTemplate;
