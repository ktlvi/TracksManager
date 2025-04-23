import { BrowserRouter, Routes, Route } from "react-router-dom";
import TracksList from "./components/TracksList";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<TracksList />} />
                <Route path="/tracks" element={<TracksList />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
