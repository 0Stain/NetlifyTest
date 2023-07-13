import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import supabase from '../config/supabaseClient';
import { useAuth } from './AuthContext';
import LoadingPage from './LoadingPage';
import { Box, Center, Heading, Input, IconButton, Button } from '@chakra-ui/react';
import axios from 'axios';
import { delay } from 'framer-motion';

interface Persona {
  id: number;
  icon: string;
  name: string;
}

interface PromptingPageProps {
  setPrompt: (prompt: string) => void;
}

type OutputItem = string; // each item is a string formatted as a URI
type Output = OutputItem[]; // the output is an array of such items


const PromptingPage: React.FC<PromptingPageProps> = ({ setPrompt }) => {
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const { isLoggedIn, userId } = useAuth();
  
 

  useEffect(() => {
    setPrompt('');

  const storedPrompt = localStorage.getItem('prompt');
  
  if (storedPrompt && localStorage.getItem('isRefreshing') === 'true') {
    setSearchText(storedPrompt); // Set the search text to the stored prompt
    generatePrompt(storedPrompt); // Call the function that sends the stored prompt to the backend
  }

  return () => {
    // Remove the prompt and flag from localStorage
    localStorage.removeItem('prompt');
    localStorage.removeItem('isRefreshing');
  };
  
  }, [applicationId]);
  

  const generateIcon = async (prompt : string) => {
    try {
        const response = await fetch('https://kog-staging-backend-7vldd72esq-od.a.run.app/api/generateIcon', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        if (response.ok) {
            const { imageUrl } = await response.json();
            return imageUrl;
        } else {
            console.log('Failed to generate image:', response);
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
  };



  

  const fetchPersonas = async (confirmation: boolean, applicationId: number | null) => {
    try {
      if (!applicationId) {
        throw new Error('Application ID is missing.');
      }
  
      const { data: personas, error } = await supabase
        .from('personas')
        .select('*')
        .eq('application_id', applicationId.toString());
      console.log('Fetched personas:', personas);
  
      if (error) {
        console.error('Error fetching personas:', error.message);
        return null;
      }
  
      console.log('Fetched personas:', personas);
      return personas;
    } catch (error) {
      return null;
    }
  };
  

  const generatePrompt = async (prompt: string) => {
    setLoading(true);
    
    if (!localStorage.getItem('isRefreshing')) {
      // Store the prompt in local storage
      localStorage.setItem('prompt', prompt || searchText);
      // Set isRefreshing to true to know that the next call will be due to a refresh
      localStorage.setItem('isRefreshing', 'true');
    }
    // Send the prompt to the backend
    try {
      console.log('Sending prompt to backend:', prompt);
  
      const response = await axios.post('https://kog-staging-backend-7vldd72esq-od.a.run.app/api/generate', { prompt: searchText });
      console.log('Received response:', response.data);
      console.log('Sent prompt to backend:', searchText);
  
      const { confirmation, applicationId: receivedApplicationId, confirmationNeeds } = response.data;
      console.log('Confirmation:', confirmation);
      console.log('Application ID:', receivedApplicationId);
      localStorage.removeItem('prompt');
      localStorage.removeItem('isRefreshing');
  
      if (confirmation) {
        setPrompt(searchText);
        setApplicationId(receivedApplicationId);
        setLoading(true); // Set loading state to true while waiting for the confirmation and application ID
        fetchPersonas(confirmation, applicationId);
        localStorage.removeItem('prompt');// Clear the prompt from local storage
        localStorage.removeItem('isRefreshing');// Clear isRefreshing from local storage 
        navigate('/users', { state: { prompt: searchText, applicationId: receivedApplicationId, confirmationNeeds } });
      } else {
        console.error('Error: Prompt confirmation failed.');
      }

      const iconUrl = await generateIcon(searchText);
  
    if (iconUrl) {
      try {
        console.log('Storing generated image:', iconUrl, userId);
        const { data: newApp, error } = await supabase.from('created_apps').insert([
          { icon: iconUrl, user_id: userId },
        ]);
  
        if (error) {
          console.error('Error storing generated image:', error.message);
        }
      } catch (error) {
        console.error('Error storing generated image:', error);
      }
    }

    } catch (error) {
      console.error('Error sending prompt to backend:', error);
      

    }
  };

  const handleGenerateClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    generatePrompt(searchText);
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      generatePrompt(searchText);
    }
  };
  
  const handleMicClick = () => {
    // Creates a new instance of SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    // If the browser supports SpeechRecognition
    if (SpeechRecognition) {
      // Create a new instance of SpeechRecognition
      const recognition = new SpeechRecognition();

      // Sets the language to English
      recognition.lang = 'en-US';
      // Stops listening after the first result
      recognition.interimResults = false;
      // Sets the maximum number of results to 1
      recognition.maxAlternatives = 1;
      // When the recognition gets a result
      recognition.onresult = (event) => {
        // Get the transcript of the result
        const transcript = event.results[0][0].transcript;
        setSearchText(transcript);
      };

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
    } else {
      alert('Speech recognition is not supported in your browser.');
    }
  };

  if (Loading ) {
    return <LoadingPage  />;
  }

  return (
    <Box minHeight="calc(100vh - (Header height + Footer height))" mt={6} bgColor="#1E1E1E" color="white">
      
      <Center flexDirection="column" alignItems="center">
        <Heading as="h1" textAlign="center" fontSize="3rem" color="white">
          Describe the application you want to create:
        </Heading>
        <Box position="relative" width="100%" maxWidth="800px" mt={12}>
          <Input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="example: A cooking app that allows user to share and store recipes"
            bgColor="white"
            color="#7A7A7A"
            height="70px"
            width="100%"
            py={4}
            px={16}
            ml={-10}
            fontSize="1.2rem"
            textAlign="left"
            border="2px solid #7A7A7A"
            borderRadius="30px"
            _focus={{
              borderColor: "#7A7A7A",
              placeholder: { color: "transparent" }
            }}
            _focusVisible={{ borderColor: "#7A7A7A" }}
          />
          <IconButton
            icon={<FontAwesomeIcon icon={faMicrophone} />}
            onClick={handleMicClick}
            color={listening ? 'red' : 'black'}
            position="absolute"
            right="14"
            top="50%"
            transform="translateY(-50%)"
            fontSize="1.5rem"
            cursor="pointer"
            variant="unstyled"
            aria-label={''}
          />
        </Box>
        <Button
          mt={12}
          bg="#9fb9eb"
          color="white"
          px={4}
          py={2}
          borderRadius="md"
          fontSize="1.2rem"
          _hover={{ bg: "#368f7a" }}
          onClick={handleGenerateClick}
        >
          Generate
        </Button>
      </Center>
    </Box>
  );
};

export default PromptingPage;