# ChatApp

ChatApp is a React-based application that provides a chat interface to communicate with an AI model hosted at a local endpoint. This app is built using Material-UI (MUI) for its user interface components and follows modern React practices for state and effect management.

## Features

- Real-time chat interface with streaming responses.
- Differentiates between user and assistant messages.
- Displays AI reasoning ("think") and responses separately.
- Responsive design using Material-UI components.

## Prerequisites

Before running the app, ensure the following:

- **Node.js**: Version 14.x or above.
- **npm**: Version 6.x or above.
- **AI Model Server**: Running at `http://localhost:11434/api/chat` with Ollama and `deepseek-r1:14b` installed.

## Ollama Setup

To run the AI model locally, you need to set up Ollama with `deepseek-r1:14b`.

1. Install Ollama by following the instructions at [Ollama's official site](https://ollama.ai/).

2. Once installed, run the following command to pull the `deepseek-r1:14b` model:
   ```bash
   ollama pull deepseek-r1:14b
   ```

3. Start the Ollama server:
   ```bash
   ollama serve
   ```

Make sure Ollama is running before starting the chat application.

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd chat-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Install additional dependencies for Material-UI:

   ```bash
   npm install @emotion/react @emotion/styled
   ```

## Running the Application

Start the development server:

```bash
npm start
```

Open your browser and navigate to:

```
http://localhost:3000
```

## Configuration

### Backend Endpoint

The application sends messages to the AI model running at `http://localhost:11434/api/chat`. If your backend uses a different endpoint, update the `fetch` URL in the `sendMessage` function located in `src/App.tsx`.

### Dependencies

- **React**: Frontend framework.
- **Material-UI (MUI)**: For UI components and styling.
- **@emotion/react** and **@emotion/styled**: For Material-UI styling.

## File Structure

```
chat-app/
├── public/
│   └── index.html     # Main HTML file
├── src/
│   ├── components/    # UI components
│   ├── App.tsx        # Main application logic
│   ├── index.css      # Global styles
│   └── index.tsx      # Entry point
├── package.json       # Project configuration and dependencies
└── README.md          # Project documentation
```

## Usage

1. Enter your message in the input field and press **Enter** or click **Send**.
2. The assistant will process your query and respond with its reasoning (`<think>` content) and a formatted response.

## Troubleshooting

### Common Errors

- **Missing dependencies**: Ensure `@emotion/react` and `@emotion/styled` are installed.
  ```bash
  npm install @emotion/react @emotion/styled
  ```
- **Backend not running**: Ensure the AI model server is running at `http://localhost:11434/api/chat`.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- [Material-UI](https://mui.com/): For UI components.
- [React](https://reactjs.org/): For the frontend framework.

