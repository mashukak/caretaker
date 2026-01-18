import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/main.css";
import { AuthProvider } from "./store/AuthContext";
import { seedDemoJobsAlways10 } from "./store/seedDemoJobs";
seedDemoJobsAlways10();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

