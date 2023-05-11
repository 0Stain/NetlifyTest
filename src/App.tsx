import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import PromptingPage from './components/PromptingPage';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Users from './components/Users';
import UserNeeds from './components/UserNeeds';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import supabase from './config/supabaseClient';
import PromptResult from './components/PromptResult';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        backgroundColor: '#1E1E1E',
        color: 'white',
      },
    },
  },
});

const Main: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const location = useLocation();
  const showHeaderFooter = !['/signup', '/signin'].includes(location.pathname);
  const showPrompt = ['/webapp', '/users'].includes(location.pathname);

  return (
    <div className="App">
      {showHeaderFooter && <Header prompt={prompt} showPrompt={showPrompt} />}
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/webapp" element={<PromptingPage setPrompt={setPrompt} />} />
          <Route path="/users" element={<Users />} />
          <Route path="/userneeds" element={<UserNeeds selectedPersonas={[]} prompt={prompt} />} />
          <Route path="/prompt_result" element={<PromptResult />} />
        </Routes>
      </main>
      {showHeaderFooter && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Main />
      </Router>
    </ChakraProvider>
  );
};

export default App;
