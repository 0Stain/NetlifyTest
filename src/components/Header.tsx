import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Flex, Image, Button, Text } from '@chakra-ui/react';
import logo from '../assets/Kog Logo.png';
import { useAuth } from './AuthContext';


interface HeaderProps {
  prompt: string;
  showPrompt: boolean;
}

const Header: React.FC<HeaderProps> = ({ prompt, showPrompt }) => {
  const { isLoggedIn, username, signOut } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    signOut();
    localStorage.clear(); // Clear local storage
    sessionStorage.clear(); // Clear session storage
  };

  const isLandingPage = location.pathname === '/';

  return (
    <>
      <Box as="header" p={4} bg="#1E1E1E">
        <Flex justify="space-between" alignItems="center">
          <Box mr="1.5%">
            <Image src={logo} alt="Your Logo" width="60px" ml="55%" />
          </Box>
          <Flex alignItems="center">
            {showPrompt && (
              <Box
                fontWeight="bold"
                backgroundImage="linear-gradient(to right, #F8E074, #A1A9D5, #F38DCD)"
                style={{ WebkitBackgroundClip: 'text' }} // Use inline style object
                backgroundClip="text"
                color="transparent"
                fontSize="1.7rem"
                position="absolute"
                left="50%"
                transform="translateX(-50%)"
              >
                {prompt}
              </Box>
            )}
            {isLoggedIn ? (
              <>
                <Text
                  fontWeight="bold"
                  mt="-0.5rem"
                  mr="2rem"
                  backgroundImage="linear-gradient(to right, #F8E074, #A1A9D5, #F38DCD)"
                  style={{ WebkitBackgroundClip: 'text' }} // Use inline style object
                  backgroundClip="text"
                  color="transparent"
                  fontSize="1.3rem"
                >
                  Welcome, {username}!
                </Text>
                {isLandingPage && (
                  <Button
                  fontWeight="bold"
                  mt="-0.5rem"
                  mr="1.5rem"
                  backgroundImage="linear-gradient(to right, #F8E074, #A1A9D5, #F38DCD)"
                  style={{ WebkitBackgroundClip: 'text' }} // Use inline style object
                  backgroundClip="text"
                  color="transparent"
                  fontSize="1.3rem"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
                )}
              </>
            ) : (
              <>
                <Link to="/signin">
                  <Button
                    fontWeight="bold"
                    mt="-0.5rem"
                    mr="5rem"
                    backgroundImage="linear-gradient(to right, #F8E074, #A1A9D5, #F38DCD)"
                    style={{ WebkitBackgroundClip: 'text' }} // Use inline style object
                    backgroundClip="text"
                    color="transparent"
                    fontSize="1.7rem"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    bg="#9fb9eb"
                    color="white"
                    fontSize="1.4rem"
                    fontWeight="bold"
                    px={4}
                    py={2}
                    borderRadius="4px"
                    _hover={{ bg: '#368f7a' }}
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </Flex>
        </Flex>
      </Box>
      <Box bg="white" height="1px" margin="0 2.5%" opacity="0.5" />
    </>
  );
};


export default Header;