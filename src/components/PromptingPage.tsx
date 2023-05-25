import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import supabase from '../config/supabaseClient';
import LoadingPage from './LoadingPage';
import { Box, Center, Heading, Input, IconButton, Button } from '@chakra-ui/react';


interface Persona {
  id: number;
  icon: string;
  name: string;
}

interface PromptingPageProps {
  setPrompt: (prompt: string) => void;
}

const PromptingPage: React.FC<PromptingPageProps> = ({ setPrompt }) => {
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [Loading, setLoading] = useState(false);


  useEffect(() => {
    setPrompt('');
    fetchPersonas(searchText.toLowerCase());
  }, [searchText, setPrompt]);

  const fetchPersonas = async (keyword: string) => {
    try {
      const { data: applications, error } = await supabase
  .from('applications')
  .select('*')
  .ilike('appDescription', `%${keyword}%`);
  console.log('keyword is ',keyword); 
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

  const handleGenerateClick = () => {
    setLoading(true); // Set the loading state to true when the next button is clicked
    setTimeout(() => { // <-- Add a delay
      setPrompt(searchText);
      setLoading(false); // <-- Stop loading after setting prompt
      navigate('/users', { state: { prompt: searchText, applicationId } });
    }, 5000); // <-- 5 second delay
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
            variant="unstyled" aria-label={''}          />
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