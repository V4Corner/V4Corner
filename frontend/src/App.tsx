import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './routes/Home';
import Blogs from './routes/Blogs';
import About from './routes/About';
import Login from './routes/Login';
import Register from './routes/Register';
import Members from './routes/Members';
import UserProfile from './routes/UserProfile';

// Main layout wires shared navigation + footer around routed pages.
// Add new pages by registering a new <Route> entry.
function App() {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/members" element={<Members />} />
          <Route path="/users/:userId" element={<UserProfile />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
