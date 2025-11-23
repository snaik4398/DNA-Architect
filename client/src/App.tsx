import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import ProjectDetails from './pages/ProjectDetails';
import Navbar from './components/Navbar';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/admin" element={<AdminPanel />} />
                            <Route path="/project/:id" element={<ProjectDetails />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </ThemeProvider>
    );
}

export default App;
