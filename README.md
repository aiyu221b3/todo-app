# PolyMath Engine Command Center

This is a local React application for the PolyMath Engine Command Center.

## Setup

1.  **Install Dependencies** (Already done):
    ```powershell
    npm install
    ```

2.  **Environment Setup**:
    -   Copy `.env.example` to `.env`:
        ```powershell
        cp .env.example .env
        ```
    -   Open `.env` and fill in your Firebase configuration keys.
        -   If you don't have these yet, the app will still run but Authentication/Database features won't work (fallback mode).

3.  **Run Locally**:
    ```powershell
    npm run dev -- --host
    ```
    -   Access at: `http://localhost:5173`
    -   Network access: `http://<YOUR_IP>:5173` (See terminal output)

## Build for Production

To create a production build:
```powershell
npm run build
```
The output will be in the `dist` folder.
