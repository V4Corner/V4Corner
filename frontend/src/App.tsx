import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './routes/Home';
import Blogs from './routes/Blogs';
import BlogDetail from './routes/BlogDetail';
import CreateBlog from './routes/CreateBlog';
import EditBlog from './routes/EditBlog';
import About from './routes/About';
import Login from './routes/Login';
import Register from './routes/Register';
import Members from './routes/Members';
import UserProfile from './routes/UserProfile';
import EditProfile from './routes/EditProfile';
import ChatList from './routes/ChatList';
import ChatDetail from './routes/ChatDetail';
import NoticeList from './routes/NoticeList';
import NoticeDetail from './routes/NoticeDetail';

// Main layout wires shared navigation + footer around routed pages.
// Add new pages by registering a new <Route> entry.
// Important: More specific routes must come before parameterized routes!
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
          <Route path="/blogs/new" element={<CreateBlog />} />
          <Route path="/blogs/:blogId/edit" element={<EditBlog />} />
          <Route path="/blogs/:blogId" element={<BlogDetail />} />
          <Route path="/notices" element={<NoticeList />} />
          <Route path="/notices/:noticeId" element={<NoticeDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/members" element={<Members />} />
          <Route path="/users/me" element={<EditProfile />} />
          <Route path="/users/:userId" element={<UserProfile />} />
          <Route path="/chat" element={<ChatList />} />
          <Route path="/chat/:conversationId" element={<ChatDetail />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
