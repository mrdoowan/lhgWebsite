# Doowan Stats Client & Server

The following need to be installed into Linux (sudo apt update):
+ npm
+ nodejs: v12.16.1
+ awscli
    + "aws configure"
+ redis-server
    + Linux: "sudo systemctl restart redis.servis"
    + WSL: "sudo service redis-server start"

When you pull this repo, use "npm install" to download the packages in both the root AND under the "client" directory.
- Windows 10 WSL, Ubuntu, and VS Code for development environment. [Video](https://www.youtube.com/watch?v=A0eqZujVfYU)
- To start a React setup from afresh. [Video](https://www.youtube.com/watch?v=v0t42xBIYIs)

## Running the Server & Client

Run the following command lines in the root directory.

To get the server running only: (Server is running on Port 5000)
- **NOTE:** The .env file is needed from Doowan. Once received, place it in the root directory
```sh
npm run server
```

To get the client running only: (Client is running on Port 3000)
```sh
npm run client
```

To run both server and client:
```sh
npm run dev
```