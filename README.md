Here is a `README.md` file to guide you on how to build and run the project:

```markdown
# Node.js WebSocket Server

This is a simple WebSocket server built with Node.js and the `ws` library. It allows clients to connect, send messages, and interact with a room-based system.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (version 22 or compatible)
- [Docker](https://www.docker.com/) (optional, if you want to run the server in a container)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Server Locally

1. Start the WebSocket server:
   ```bash
   node src/server.js
   ```

2. The server will start and listen on port `8080` by default.

## Running the Server with Docker

1. Build the Docker image:
   ```bash
   docker build -t websocket-server .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 8080:8080 websocket-server
   ```

3. The server will be accessible on `http://localhost:8080`.

## Project Structure

- `src/server.js`: Main WebSocket server implementation.
- `Dockerfile`: Configuration for building the Docker image.
- `package.json`: Project dependencies and scripts.

## Usage

- Clients can connect to the WebSocket server on `ws://localhost:8080`.
- Supported events include:
    - `join-room`
    - `update-estimate`
    - `reset-room`
    - `remove-player`

## License

This project is licensed under the MIT License.
```