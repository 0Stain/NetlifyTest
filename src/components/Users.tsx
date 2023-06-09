import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Heading, Button, Image, Text, SimpleGrid, IconButton, useColorModeValue } from '@chakra-ui/react';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@chakra-ui/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faCheck } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Users.module.css';
import supabase from '../config/supabaseClient';

interface Persona {
  id: number;
  icon: string;
  name: string;
}

const Users: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const prompt = (location.state as { prompt: string } | undefined)?.prompt || '';
  const applicationId = (location.state as { applicationId: number } | undefined)?.applicationId || null;
  const [usersList, setUsersList] = useState<Persona[]>([]);
  const [checkedUsers, setCheckedUsers] = useState(
    new Set(JSON.parse(localStorage.getItem('checkedUsers') || '[]'))
  );


  useEffect(() => {
    const storedCheckedUsers = localStorage.getItem('checkedUsers');
    if (!storedCheckedUsers || JSON.parse(storedCheckedUsers).length === 0) {
      const allUsersChecked = new Set(usersList.map(user => user.id));
      setCheckedUsers(allUsersChecked);
      localStorage.setItem('checkedUsers', JSON.stringify(Array.from(allUsersChecked)));
    } else {
      setCheckedUsers(new Set(JSON.parse(storedCheckedUsers)));
    }
  }, [usersList]);
  
  
  

  useEffect(() => {
    const checkedUsersArray = Array.from(checkedUsers);
    localStorage.setItem('checkedUsers', JSON.stringify(checkedUsersArray));
  }, [checkedUsers]);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const { data: personas, error } = await supabase
          .from('personas')
          .select('*')
          .eq('application_id', applicationId);

        if (error) {
          console.error('Error fetching personas:', error.message);
          return;
        }

        if (!personas || personas.length === 0) {
          console.log('No personas found.');
          return;
        }

        const filteredPersonas = (personas as Persona[]).filter(
          (persona: Persona) => persona.name.toLowerCase() !== 'general'
        );

        setUsersList(filteredPersonas);


        if (!localStorage.getItem('checkedUsers')) {
          const allUsersChecked = new Set(filteredPersonas.map(user => user.id));
          setCheckedUsers(allUsersChecked);
        }
      } catch (error) {
        console.error('Error fetching personas:', error);
      }
    };

    if (applicationId) {
      fetchPersonas();
    }
  }, [applicationId, setUsersList, ]);
 

  const handleCheckToggle = (id: number) => {
    const updatedCheckedUsers = new Set(checkedUsers);
    if (updatedCheckedUsers.has(id)) {
      updatedCheckedUsers.delete(id);
    } else {
      updatedCheckedUsers.add(id);
    }
    setCheckedUsers(updatedCheckedUsers);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const isChecked = (id: number) => checkedUsers.has(id);
  const btnBg = useColorModeValue('gray.200', 'gray.700');

  return (

    <Box minH="calc(100vh - 8rem)" bgColor="#1E1E1E" color="white" p="2rem">
    <Heading as="h1" textAlign="center" fontSize="3rem" mb="2rem">For that, our users will be:</Heading>

    <SimpleGrid columns={{ base: 1, md: 3 }} spacing="2rem">
      {usersList.map((user: Persona) => (
        <Box 
          key={user.id} 
          position="relative" 
          textAlign="center"
          display="flex" 
          flexDirection="column" 
          alignItems="center"
        >
          <IconButton
            position="absolute"
            top="10px"
            right="10px"
            bgColor={isChecked(user.id) ? "#6992df" : btnBg}
            color={isChecked(user.id) ? "white" : "white"}
            _hover={{ bgColor: isChecked(user.id) ? "#368f7a" : btnBg, transform: "scale(1.2)" }}
            icon={<CheckIcon />}
            onClick={() => handleCheckToggle(user.id)} aria-label={''}          
          />
          {user.icon.startsWith('&#') ? (
  <Text fontSize="8xl" dangerouslySetInnerHTML={{ __html: user.icon }} opacity={isChecked(user.id) ? 1 : 0.5}/>
) : (
  <Image
    src={user.icon}
    alt={user.name}
    boxSize="180px"
    borderRadius="full"
    objectFit="cover"
    opacity={isChecked(user.id) ? 1 : 0.5}
    filter={isChecked(user.id) ? "none" : "grayscale(100%)"}
  />
)}

          <Text mt="0.5rem" fontSize="1.2rem">{user.name}</Text>
        </Box>
      ))}
    </SimpleGrid>
    <Box display="flex" justifyContent="center" w="100%">
      <Box display="flex" justifyContent="space-between" maxW="600px" mt="3rem">
        <Button 
          bgColor="#7a7a7a" 
          color="#fff" 
          _hover={{ bgColor: "#4c4c4c" }} 
          leftIcon={<ArrowLeftIcon />} 
          onClick={handleBackClick}
          mr={4}
        >
          Back
        </Button>
        <Button 
          bgColor="#62d667" 
          color="#fff" 
          _hover={{ bgColor: "#3aa53a" }} 
          rightIcon={<ArrowRightIcon />} 
          onClick={() => {
            // Find the corresponding persona objects for the selected persona IDs and filter out undefined values
            const selectedPersonas = Array.from(checkedUsers).map((id) => usersList.find((user) => user.id === id)).filter((p): p is Persona => !!p);
            // Navigate to the UserNeeds page with the selected persona IDs
            navigate('/userneeds', { state: { selectedPersonaIds: selectedPersonas.map(p => p.id), prompt } });
          }}
          isDisabled={checkedUsers.size === 0}
          ml={4}
        >
          Next
        </Button>
      </Box>
    </Box>
</Box>


          );
          };
          
          export default Users;