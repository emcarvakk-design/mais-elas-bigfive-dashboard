import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BigFiveProvider } from "./contexts/BigFiveContext";
import Dashboard from "./pages/Dashboard";
import ProfileDetail from "./pages/ProfileDetail";
import Compare from './pages/Compare';
import TestApp from './pages/TestApp';
import MaisElasDashboard from './pages/mais-elas/Dashboard';
import MaisElasProfile from './pages/mais-elas/ProfileDetail';
import { LQARoot, LQAProfileRoute } from './pages/lqa';

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"\\"} component={Dashboard} />
      <Route path={"/profile/:id"} component={ProfileDetail} />
      <Route path={"/compare"} component={Compare} />
      <Route path={"/teste"} component={TestApp} />
      <Route path={"/mais-elas"} component={MaisElasDashboard} />
      <Route path={"/mais-elas/perfil/:id"} component={MaisElasProfile} />
      <Route path={"/lqa"} component={LQARoot} />
      <Route path={"/lqa/perfil/:id"} component={LQAProfileRoute} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <BigFiveProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </BigFiveProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
