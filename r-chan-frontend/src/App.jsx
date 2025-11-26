import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { postService } from './services/postService'
import PostList from './components/PostList'
import CreatePost from './components/CreatePost'
import ThreadPage from './components/ThreadPage'
import './App.css'

function App() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const loadPosts = async () => {
    try {
      const response = await postService.getAllPosts()
      setPosts(response.data)
    } catch (error) {
      console.error('Error cargando posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts])
  }

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Cargando posts...</div>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={
            <>
              <header className="app-header">
                <h1>R-Chan</h1>
              </header>
              <main className="app-main">
                <CreatePost onPostCreated={handlePostCreated} />
                <PostList posts={posts} />
              </main>
            </>
          } />
          <Route path="/thread/:postId" element={<ThreadPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App