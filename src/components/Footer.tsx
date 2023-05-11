import React from 'react';
import styles from '../styles/Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>© {new Date().getFullYear()} Kog.ai All rights reserved.</p>
    </footer>
  );
};

export default Footer;
