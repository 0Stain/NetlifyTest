import React, { useState } from 'react';
import supabase from '../config/supabaseClient';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/SignIn.module.css';
import logo from '../assets/Mini Kog Logo.png';
import { FaGoogle, FaLinkedin } from 'react-icons/fa';
import { BiHide, BiShow } from 'react-icons/bi';
import axios from 'axios';
import { useAuth } from './AuthContext';
import {
  Box,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  
const validateEmail = (email: string) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email.toLowerCase());
};


const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateEmail(email)) {
    alert('Invalid email.');
    return;
  }

 await signIn(email, password);
  
    navigate('/');

};




  
  
  
return (
  <Center minHeight="100vh" backgroundColor="#f0f4f8">
  <Container>
    <Box textAlign="center" mb={8}>
      <Flex justifyContent="center" alignItems="center">
  <img src={logo} alt="Your Logo" width={'100px'} />
</Flex>
    </Box>
    <Text
      textAlign="center"
      fontSize="1.5rem"
      fontWeight="bold"
      mb={4}
      color="#000000"
    >
      Welcome back!
    </Text>
    <form onSubmit={handleSignIn}>
      <Stack spacing={4}>
        <FormControl isRequired>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            borderRadius="5px"
            borderColor="#cccccc"
            color={'#1E1E1E'}
            _focus={{ borderColor: '#1E1E1E' }}
          />
        </FormControl>
        <FormControl isRequired>
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              borderRadius="5px"
              borderColor="#cccccc"
              color={'#1E1E1E'}
              _focus={{ borderColor: '#1E1E1E' }}
            />
            <InputRightElement>
              <IconButton
                icon={showPassword ? <BiHide /> : <BiShow />}
                color={'#1E1E1E'}
                onClick={() => setShowPassword(!showPassword)}
                variant="unstyled" aria-label={''}
              />
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <Link
          href="#"
          textAlign="right"
          textDecoration="none"
          color="#1E1E1E"
          _hover={{ textDecoration: 'underline' }}
        >
          Forgot password?
        </Link>
        <Button
          type="submit"
          w="100%"
          borderRadius="5px"
          backgroundColor="#1E1E1E"
          color="#ffffff"
          
          _hover={{ backgroundColor: '#3b6ebe' }}
        >
          Sign In
        </Button>
      </Stack>
    </form>
    <Flex mt={4} justifyContent="center" alignItems="center" >
      <Text>Don't have an account? </Text>
        <Link
          href="/signup"
          ml={2}
          textDecoration="none"
          color="#1E1E1E"
          
          _hover={{ textDecoration: 'underline' }}
        >
          Sign Up
        </Link>
      </Flex>
      <Flex mt={4} justifyContent="space-between" alignItems="center">
        <Divider borderColor="#cccccc" />
        <Text mx={2} fontSize="1rem">
          or
        </Text>
        <Divider borderColor="#cccccc" />
      </Flex>
      <Stack spacing={3} mt={4}>
        <Button
          leftIcon={<FaGoogle />}
          w="100%"
          borderRadius="5px"
          backgroundColor="#ffffff"
          color="#1E1E1E"
          borderColor="#1E1E1E"
          borderWidth="2px"
          _hover={{ backgroundColor: '#1E1E1E', color: '#ffffff' }}
        >
          Sign In with Google
        </Button>
        <Button
          leftIcon={<FaLinkedin />}
          w="100%"
          borderRadius="5px"
          backgroundColor="#ffffff"
          color="#1E1E1E"
          borderColor="#1E1E1E"
          borderWidth="2px"
          
          _hover={{ backgroundColor: '#1E1E1E', color: '#ffffff' }}
        >
          Sign In with LinkedIn
          </Button>
        </Stack>
      </Container>
    </Center>
  );
};

export default SignIn;