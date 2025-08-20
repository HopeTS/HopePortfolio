import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { useTheme } from "@context";
import * as P from "@pages";

function App() {
  const { theme } = useTheme();
  return (
    <div className="App" data-theme={theme}>
      <Router>
        <nav></nav>
        <Routes>
          <Route path="/" exact element={<P.Home />} />
          <Route path="*" element={<P.Wildcard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
