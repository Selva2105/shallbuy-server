const result = () => {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Activation Success</title>
<style>
    body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }
    .container {
        background-color: #ffffff;
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        text-align: center;
    }
    h1 {
        color: #7C3AED;
    }
    p {
        color: #333;
        margin: 20px 0;
    }
    .button {
        background-color: #7C3AED;
        color: white;
        border: none;
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        border-radius: 5px;
        text-decoration: none;
    }
</style>
</head>
<body>
<div class="container">
    <h1>Activation Successful!</h1>
    <p>Your account has been successfully activated. You can now enjoy all the features of our service.</p>
    <a href="https://ecom-web-rho.vercel.app/login" class="button"">Go to Dashboard</a>
</div>
</body>
</html>`;
};

export default result;
