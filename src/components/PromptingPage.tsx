import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import supabase from '../config/supabaseClient';
import { useAuth } from './AuthContext';
import LoadingPage from './LoadingPage';
import { Box, Center, Heading, Input, IconButton, Button } from '@chakra-ui/react';
import axios from 'axios';

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

  const { isLoggedIn, userId } = useAuth();
console.log('userId is ', userId);
  if (!isLoggedIn) {
    throw new Error('User not authenticated');
  }

  useEffect(() => {
    setPrompt('');
    fetchPersonas(searchText.toLowerCase());
  }, [searchText, setPrompt]);

  const generateIcon = async (prompt : string) => {
    try {
        const response = await fetch('https://kog-staging-backend-7vldd72esq-od.a.run.app/api/generateIcon', {
            method: 'POST',
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


  

  const fetchPersonas = async (keyword: string) => {
    try {
      const { data: applications, error } = await supabase
        .from('applications')
        .select('*')
        .ilike('appDescription', `%${keyword}%`);
      console.log('keyword is ', keyword);
      console.log('Fetched applications:', applications);

      if (error) {
        console.error('Error fetching applications:', error.message);
        return null;
      }

      if (!applications || applications.length === 0) {
        console.log('No matching application found.');
        return null;
      }

      const applicationId = applications[0].id;
      setApplicationId(applicationId);

      const { data: personas, error: personasError } = await supabase
        .from('personas')
        .select('*')
        .eq('application_id', applicationId.toString());
      console.log('Fetched personas:', personas);

      if (personasError) {
        console.error('Error fetching personas:', personasError.message);
        return null;
      }

      console.log('Fetched personas:', personas);
      return personas;
    } catch (error) {
      console.error('Error fetching personas:', error);
      return null;
    }
  };

  const handleGenerateClick = async () => {
    setLoading(true);
    const iconUrl = await generateIcon(searchText);

    if(iconUrl) {
      try {
        console.log('Storing generated image:', iconUrl, userId);
        const { data: newApp, error } = await supabase
          .from('created_apps')
          .insert([
            { icon: iconUrl, user_id: userId },
          ]);

        if (error) {
          console.error('Error storing generated image:', error.message);
        }
      } catch (error) {
        console.error('Error storing generated image:', error);
      }
    }

    setTimeout(() => {
      setPrompt(searchText);
      setLoading(false);
      navigate('/users', { state: { prompt: searchText, applicationId } });
    }, 6000);
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenerateClick();
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

  if (Loading && applicationId) {
    return <LoadingPage applicationId={applicationId} />;
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
