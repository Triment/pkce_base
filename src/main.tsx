import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Use BrowserRouter
// Removed RecoilRoot import
import { HeroUIProvider } from '@heroui/react'; // Import NextUIProvider
import { App } from './App';
import './global.css'; // Ensure global styles are imported

// No need to define router separately for a single route handled by App
// const router = createBrowserRouter([ ... ])

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
    <BrowserRouter future={{
      v7_startTransition: true,
    }}> {/* Provides routing context */}
      <HeroUIProvider> {/* Provides NextUI theme and context */}
        <main className="dark text-foreground bg-background"> {/* Optional: Apply dark theme globally */}
            <App />
          </main>
        </HeroUIProvider>
      </BrowserRouter>
);
