import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Toaster } from "sonner"

import "@workspace/ui/globals.css"
import { App } from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { WalletProvider } from "@/contexts/WalletContext"
import { WebSocketProvider } from "@/contexts/WebSocketContext"
import { ErrorBoundary } from "@/components/ErrorBoundary"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <WalletProvider>
          <WebSocketProvider>
            <App />
            <Toaster position="top-right" richColors />
          </WebSocketProvider>
        </WalletProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
)
