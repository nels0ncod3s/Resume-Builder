import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Workspace from "./pages/Workspace.jsx";
import BuilderPage from "./pages/BuilderPage.jsx";
import CoverLetterPage from "./pages/CoverLetterPage.jsx";
import AtsCheckerPage from "./pages/AtsCheckerPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Workspace />}>
          <Route index element={<BuilderPage />} />
          <Route path="builder" element={<BuilderPage />} />
          <Route path="cover-letter" element={<CoverLetterPage />} />
          <Route path="ats-checker" element={<AtsCheckerPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
