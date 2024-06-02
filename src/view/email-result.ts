const result = () => {
  return `
  <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Success Page | shallbuy</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin: 50px;
        }

        h1 {
            color: #333;
        }

        #gif-container {
            margin-top: 20px;
        }

        a {
            color: #007BFF;
            text-decoration: none;
            font-weight: bold;
        }

        .link {
            line-height: 1rem;
        }

        .container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
    </style>
</head>

<body class="container">
    <h2>Hey chief, welcome to shallbuy</h2>

    <div id="gif-container">
        <img src="https://firebasestorage.googleapis.com/v0/b/ikart-40b39.appspot.com/o/images%2Fstatic-images%2FSuccessful.gif?alt=media&token=7bd48d05-6f6f-478f-9100-28905a81ca7d" alt="Animated Gif" width="300">
    </div>

    <p>Verified sucessfully <a class="clickLink" href="https://ecom-web-rho.vercel.app/login"
            target="_blank">Click to signin</a></p>
</body>

</html>`;
};

export default result;
