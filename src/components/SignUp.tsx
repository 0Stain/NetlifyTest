import React, { useState, useRef, useEffect } from 'react';
import supabase from '../config/supabaseClient';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/SignUp.module.css';
import logo from '../assets/Mini Kog Logo.png';
import { FaGoogle, FaLinkedin } from 'react-icons/fa';
import { BiHide, BiShow } from 'react-icons/bi';
import axios from 'axios';
import {
  Box,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  FormControl,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';
import { color } from 'framer-motion';


const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [showErrorBubble, setShowErrorBubble] = useState(false);
  const errorBubbleRef = useRef<HTMLDivElement | null>(null);

  const validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  };

  const validatePassword = (password: string) => {
    const lengthRequirement = /.{8,}$/;
    const uppercaseRequirement = /(?=.*[A-Z])/;
    const lowercaseRequirement = /(?=.*[a-z])/;
    const digitRequirement = /(?=.*\d)/;
    const symbolRequirement = /(?=.*[@$!%*#?&])/;

    const errors = [];

    if (!lengthRequirement.test(password)) {
      errors.push('Your password must be at least 8 characters long.');
    }
    if (!uppercaseRequirement.test(password)) {
      errors.push('Your password must contain at least 1 uppercase letter.');
    }
    if (!lowercaseRequirement.test(password)) {
      errors.push('Your password must contain at least 1 lowercase letter.');
    }
    if (!digitRequirement.test(password)) {
      errors.push('Your password must contain at least 1 digit.');
    }
    if (!symbolRequirement.test(password)) {
      errors.push('Your password must contain at least 1 special character (@, $, !, %, *, #, ?, &).');
    }

    return errors;
  };

  const handleInputBlur = () => {
    const newErrors = validatePassword(password);
    setPasswordErrors(newErrors);
  };
  const handleClickOutside = (event: MouseEvent) => {
    if (errorBubbleRef.current && !errorBubbleRef.current.contains(event.target as Node)) {
      setShowErrorBubble(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailValidation = validateEmail(email);
    const passwordErrors = validatePassword(password);
  
    if (!emailValidation || passwordErrors.length > 0) {
      let errorMessage = '';
  
      if (!emailValidation) {
        errorMessage += 'Invalid email.\n';
      }
  
      if (passwordErrors.length > 0) {
        errorMessage += passwordErrors.join('\n');
      }
  
      setPasswordErrors(passwordErrors);
      console.log('Validation error:', errorMessage);
      return;
    }
  
    try {
      console.log('Signing up:', { email, password, username, name });
      const {data, error } = await supabase.auth.signUp(
        { email, password }
      );
  
      console.log('SignUp response:', { data, error });
  
      if (error) {
        alert('Error creating account. Please try again.');
        return;
      }
  
      alert('Account created successfully! Please sign in.');
      navigate('/signin');
    } catch (error) {
      console.error('Exception:', error);
      alert('Error creating account. Please try again.');
    }
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
          color="#1E1E1E"
          textColor='#1E1E1E'
        >
          Create and let's create
        </Text>
        <form onSubmit={handleSignUp}>
          <Stack spacing={4}>
            <FormControl isRequired>
              <Input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                borderRadius="5px"
                borderColor="#cccccc"
                textColor='#1E1E1E'
                _focus={{ borderColor: '#1E1E1E' }}
              />
             
            </FormControl>
            <FormControl isRequired>
  <Input
    type="email"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    borderRadius="5px"
    borderColor="#cccccc"
    textColor="#1E1E1E"
    _focus={{ borderColor: '#1E1E1E' }}
  />
  {!validateEmail(email) && (
    <Box
      ref={errorBubbleRef}
      backgroundColor="#f9d4d4"
      p={2}
      borderRadius="md"
      boxShadow="md"
    >
      <Text color="red" fontSize="sm">
        Invalid email.
      </Text>
    </Box>
  )}
</FormControl>
            <FormControl isRequired>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                borderRadius="5px"
                borderColor="#cccccc"
                textColor='#1E1E1E'
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
                  onBlur={handleInputBlur}
                  borderRadius="5px"
                  borderColor="#cccccc"
                  textColor='#1E1E1E'
                  _focus={{ borderColor: '#1E1E1E' }}
                />
                <InputRightElement>
                  <IconButton
                    icon={showPassword ? <BiHide /> : <BiShow />}
                    color={'#1E1E1E'}
                    onClick={() => setShowPassword(!showPassword)}
                    variant="unstyled"
                    aria-label={''}
                  />
                </InputRightElement>
              </InputGroup>
              {passwordErrors.length > 0 && (
                <Box
                  ref={errorBubbleRef}
                  backgroundColor="#f9d4d4"
                  p={2}
                  borderRadius="md"
                  boxShadow="md"
                >
                  {passwordErrors.map((error) => (
                    <Text key={error} color="red" fontSize="sm">
                      {error}
                    </Text>
                  ))}
                </Box>
              )}
            </FormControl>
            <Button
              type="submit"
              w="100%"
              borderRadius="5px"
              backgroundColor="#1E1E1E"
              color="#ffffff"
              _hover={{ backgroundColor: '#3b6ebe' }}
            >
              Sign Up
            </Button>
          </Stack>
        </form>
        <Flex mt={4} justifyContent="center" alignItems="center">
          <Text>Already have an account? </Text>
          <Link
            href="/signin"
            ml={2}
            textDecoration="none"
            color="#1E1E1E"
            _hover={{ textDecoration: 'underline' }}
          >
            Sign In
          </Link>
        </Flex>
        <Divider borderColor="#cccccc" my={4} />
        <Stack spacing={3}>
          <Button
            leftIcon={<FaGoogle />}
            w="100%"
            borderRadius="5px"
            backgroundColor="#ffffff"
            borderColor="#1E1E1E"
            color="#1E1E1E"
            _hover={{ backgroundColor: '#1E1E1E', color: '#ffffff' }}
          >
            Sign Up with Google
          </Button>
          <Button
            leftIcon={<FaLinkedin />}
            w="100%"
            borderRadius="5px"
            backgroundColor="#ffffff"
            borderColor="#1E1E1E"
            color="#1E1E1E"
            _hover={{ backgroundColor: '#1E1E1E', color: '#ffffff' }}
          >
            Sign Up with LinkedIn
          </Button>
        </Stack>
      </Container>
    </Center>
  );
  
  
    };
    
    export default SignUp;
    
      