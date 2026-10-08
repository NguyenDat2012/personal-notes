import {Toaster} from 'sonner';
import {BrowserRouter, Routes, Route} from 'react-router';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <>
      <Toaster richColors />

      <BrowserRouter>
        <Routes>
          {/*Public routes */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/*Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
