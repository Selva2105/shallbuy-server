# shallbuy_server

## Introduction
This is the backend server for the ShallBuy application, built with Express and Prisma.

## Prerequisites
- Node.js
- npm or yarn
- MongoDB (or another database supported by Prisma)

## Installation

1. Clone the repository:
bash
git clone https://github.com/your-repository/shallbuy_server.git

2. Navigate to the project directory:
bash
cd shallbuy_server

3. Install dependencies:
bash
npm install

4. Set up the environment variables:
   - Rename `.env.example` to `.env`
   - Fill in the necessary environment variables (e.g., database URL, port)

## Running the Server

1. Start the server:
bash
npm start

   This will run the server on the port specified in your `.env` file (default is 3000).

## API Endpoints

- `/api/v1/auth`: Authentication routes

## Error Handling

Global error handling is managed by middleware that captures and processes all unhandled errors.

## Additional Information

- Ensure that the Prisma client is connected before starting the server.
- The server is configured to log HTTP requests using Morgan.