import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Header.module.css';
import logo from '../assets/Kog Logo.png';
import { useAuth } from './AuthContext';

interface HeaderProps {
  prompt: string;
  showPrompt: boolean;
}

const Header: React.FC<HeaderProps> = ({ prompt, showPrompt }) => {
  const { isLoggedIn, username, signOut } = useAuth();

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src={logo} alt="Your Logo" width={'60 px'} />
        </div>
        <nav className={styles.nav}>
          {showPrompt && <div className={styles.prompt}>{prompt}</div>}
          {isLoggedIn ? (
            <span className={styles.welcomeMessage}>Welcome, {username} !</span>
          ) : (
            <>
              <Link to="/signin" className={styles.signIn}>
                Sign In
              </Link>
              <Link to="/signup" className={styles.signUp}>
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </header>
      <div className={styles.lineDivider}></div>
    </>
  );
};

export default Header;