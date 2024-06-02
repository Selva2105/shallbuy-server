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
<title>Verify Your Email</title>
<style>
    body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
    }
    .email-container {
        background-color: #ffffff;
        width: 100%;
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .logo-img {
        width: 200px; /* Reduced size */
        height: auto;
        margin: 0 auto; /* Centers the image horizontally */
        display: block; /* Ensures the image is on its own line */
    }
    .button {
        color: #3498db;
        border: none;
        padding: 10px 20px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 10px 2px;
        cursor: pointer;
        border-radius: 5px;
    }
    
    .gray-text {
        color: #C4C0C0;
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
</style>
</head>
<body>
<div class="email-container poppins-regular">
    <img src="https://firebasestorage.googleapis.com/v0/b/ikart-40b39.appspot.com/o/images%2Fstatic-images%2Flogo.png?alt=media&token=b532a225-c164-4f91-be65-871e9297af7d" alt="Company Logo" class="logo-img">
    <h2>Welcome to Shallbuy!</h2>
    <p class="poppins-medium">Hi ${name} our beloved Chief,</p>
    <p>Welcome to Shallbuy, your one-stop destination for all your shopping needs! We are thrilled to have you on board and look forward to providing you with an exceptional online shopping experience.</p>
    <p>To ensure the security of your account, we kindly ask you to verify your email address. Simply click on the following button to complete the verification process:</p>
    <a href="${url}" class="button" target="_blank">Click to verify</a>
    <p class="gray-text">By verifying your email, you'll gain access to exclusive offers, personalized recommendations, and the latest updates on our newest arrivals. We want to make sure you don't miss out on any exciting news or promotions!</p>
    <p class="gray-text">If you have any questions or need assistance, our customer support team is here to help. Feel free to reach out to <a href="mailto:support@shallbuy.com">support@shallbuy.com</a> for prompt assistance.</p>
    <p class="gray-text">Thank you for choosing Shallbuy. We can't wait to embark on this shopping journey with you!</p>
    <p>Best Regards,<br>The Shallbuy Team</p>
</div>
</body>
</html>
`;
};

export default emailTemplate;
