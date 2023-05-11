import React from 'react';
import { useEffect, useState } from 'react';
import supabase from '../config/supabaseClient';
import { useAuth } from './AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Flex, Heading, Image, Link, Text, VStack } from '@chakra-ui/react';
import imageData from '../data/imageData.json';

interface AppData {
  id: number;
  name: string;
  description: string;
  link: string;
  user_id: string;
  icon: string;
  created_at: string;
}

const LandingPage: React.FC = () => {
  const [createdApps, setCreatedApps] = useState<AppData[]>([]);
  const { isLoggedIn, userId } = useAuth();

  useEffect(() => {
    const fetchApps = async () => {
      if (userId) {
        const { data, error } = await supabase
          .from('created_apps')
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching created apps:', error);
        } else {
          if (data) {
            setCreatedApps(data as AppData[]);
        }
      }
    }
    };

    fetchApps();
    const intervalId = setInterval(() => {
      fetchApps();
    }, 60000);
    return () => clearInterval(intervalId);
  }, [userId]);


  const deleteApp = async (appId: number) => {
    if (window.confirm('Do you want to delete this app permanently?')) {
    const { error } = await supabase
      .from('created_apps')
      .delete()
      .eq('id', appId);
  
    if (error) {
      console.error('Error deleting app:', error);
    } else {
      setCreatedApps((prevApps) => prevApps.filter((app) => app.id !== appId));
    }
  }
  };
  



  return (
    <Box textAlign="center" p={4} pl="3%" bg="#1E1E1E">   
      <Heading fontSize="3rem" color="white">
        What are we building today?
      </Heading>
      <Flex justifyContent="center" mt="5rem" gap="6rem">
        <Link as={RouterLink} to="/webapp">
          <Button
            bg="#3f3792"
            color="white"
            fontSize="1.2rem"
            fontWeight="semibold"
            borderRadius="14px"
            w="250px"
            h="60px"
            alignItems="center"
            justifyContent="center"
            textDecoration="none"
            _hover={{ backgroundColor: '#3b6ebe' }}
            rightIcon={
              <Box as="svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" w="50px" h="50px">
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5v2h4v2H7v-2h4v-2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v10h16V6H4zm8 11h2v2h-2v-2z" />
              </Box>
            }
          >
            Web App
          </Button>
        </Link>
        <Link as={RouterLink} to="/mobileapp">
          <Button
            bg="#3f3792"
            color="white"
            fontSize="1.2rem"
            fontWeight="semibold"
            borderRadius="14px"
            w="250px"
            h="60px"
            alignItems="center"
            justifyContent="center"
            textDecoration="none"
            _hover={{ backgroundColor: '#3b6ebe', textDecoration: 'none' }}
            rightIcon={
              <Box as="svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" w="50px" h="50px">
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h10V4H7zm5 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
              </Box>
            }
          >
            Mobile App
          </Button>
        </Link>
      </Flex>

      <Heading fontSize="2rem" textAlign="left" color="white" fontWeight="bold" mb="1rem" mt="8rem">
        Your previous apps:
      </Heading>
      <Flex mt="3rem" flexWrap="wrap" justifyContent="flex-start">
      </Flex>
      <Flex mt="3rem" flexWrap="wrap" justifyContent="flex-start">
  {createdApps.map((app) => (
    <Box key={app.id} w="30%" maxW="100px" m="1rem">
      <Box
        bg="white"
        borderRadius="5px"
        p="1rem"
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)"
      >
        <Image
          src={app.icon}
          alt={app.name}
          w="100%"
          h="auto"
          objectFit="cover"
          borderRadius="5px"
        />
         <Button
      colorScheme="blue"
      onClick={() => {
        window.open(app.link, '_blank', 'noopener,noreferrer');
      }}
    >
      Open
    </Button>
    <Button colorScheme="red" onClick={() => deleteApp(app.id)}>
      Delete
    </Button>
      </Box>
      <Text mt="0.5rem">{app.name}</Text>
      <Text mt="0.5rem">{new Date(app.created_at).toLocaleString()}</Text>
    </Box>
  ))}
</Flex>


    </Box>
  );
};

export default LandingPage;

