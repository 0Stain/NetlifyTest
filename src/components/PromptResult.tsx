import React, { useEffect, useState } from 'react';
import { Box, Center, Heading, VStack, Button, Link } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import Confetti from 'react-confetti';

const PromptResult: React.FC = () => {
  const [confettiPieces, setConfettiPieces] = useState(300);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setConfettiPieces(0);
    }, 1000); // Stop confetti after 1000 milliseconds (1 second)

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <Box bg="#1E1E1E" minH="100vh" color="white">
      <Confetti numberOfPieces={confettiPieces} />
      <Center py={20}>
        <VStack spacing={8}>
          <Heading>
            🎉 Your web application is ready 🎉
          </Heading>
          <Button
            colorScheme="blue"
            size="lg"
            onClick={() => {
              
            }}
          >
            Open App
          </Button>
          <Link
            href="#"
            textDecoration="underline"
            _hover={{ textDecoration: 'underline' }}
            isExternal
          >
            GitHub Repository <ExternalLinkIcon mx="2px" />
          </Link>
        </VStack>
      </Center>
    </Box>
  );
};

export default PromptResult;
