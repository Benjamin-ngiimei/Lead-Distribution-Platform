# Task Distributor X

Task Distributor X is a full-stack web application designed to help businesses manage and distribute tasks or leads to a team of agents. It features a user-friendly interface for administrators to upload lead data, manage agents, and view assignments.

## Features

*   **Authentication:** Secure login for administrators.
*   **Dashboard:** An overview of key metrics, including total agents, leads, and assignments.
*   **Agent Management:** Add, edit, and delete agents.
*   **Lead Management:** Upload leads from a CSV file and view all leads.
*   **Lead Distribution:** Automatically distribute leads among the available agents.
*   **Assignments View:** See a complete list of all lead assignments.

## Tech Stack

### Frontend

*   **Framework:** [React](https://reactjs.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **UI:** [shadcn/ui](https://ui.shadcn.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Routing:** [React Router](https://reactrouter.com/)

### Backend

*   **Framework:** [Express.js](https://expressjs.com/)
*   **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
*   **Authentication:** [JSON Web Tokens (JWT)](https://jwt.io/)

## Getting Started

### Demo Credentials

*   **Email:** `admin@gmail.com`
*   **Password:** `admin@123`
*   **you can also create new user**

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later)
*   [npm](https://www.npmjs.com/)
*   [MongoDB](https://www.mongodb.com/try/download/community) (local installation or a cloud-hosted instance)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd task-distributor-x-main
    ```

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

3.  **Install backend dependencies:**
    ```bash
    cd server
    npm install
    cd ..
    ```

4.  **Configure environment variables:**
    *   Create a `.env` file in the `server` directory.
    *   Add the following variables:
        ```
        MONGO_URI=<your-mongodb-connection-string>
        JWT_SECRET=<your-jwt-secret>
        ```

## Running the Application

### Backend

To start the backend server in development mode (with auto-reloading), run the following command from the project root:

```bash
npm run dev:server
```

Alternatively, you can build the server and then start it:

```bash
npm run build:server
npm run start:server
```

The backend server will be running on `http://localhost:5001`.

### Frontend

To start the frontend development server, run the following command from the project root:

```bash
npm run dev
```

The frontend will be running on `http://localhost:5173`.

## Available Scripts

### Root

*   `npm run dev`: Starts the frontend development server.
*   `npm run build`: Builds the frontend for production.
*   `npm run lint`: Lints the frontend code.
*   `npm run preview`: Previews the production build of the frontend.
*   `npm run build:server`: Compiles the backend TypeScript code.
*   `npm run start:server`: Starts the backend server from the compiled code.
*   `npm run dev:server`: Starts the backend server in development mode with auto-reloading.

### Server

The `server` directory has its own `package.json` for backend-specific dependencies.