import React, { useReducer, useEffect } from 'react';
import { Heading, Box, Spinner } from '@chakra-ui/react';
import supabase from '../config/supabaseClient';

interface Tip {
  id: number;
  content: string;
  application_id: number;
}

type State = {
  tips: Tip[];
  currentTip: Tip | null;
};

type Action = { type: 'NEXT' } | { type: 'RESET'; payload: Tip[] };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'NEXT':
      const nextTipIndex = state.tips.findIndex((tip) => tip === state.currentTip) + 1;
      if (nextTipIndex >= state.tips.length) {
        return { ...state, currentTip: state.tips[0] };
      } else {
        return { ...state, currentTip: state.tips[nextTipIndex] };
      }
    case 'RESET':
      return { ...state, tips: action.payload, currentTip: action.payload[0] };
    default:
      return state;
  }
};

interface LoadingPageProps {
  applicationId: number;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ applicationId }) => {
  const [state, dispatch] = useReducer(reducer, { tips: [], currentTip: null });
  const [error, setError] = React.useState<Error | null>(null);
  

  useEffect(() => {
    const timerId = setInterval(() => {
      dispatch({ type: 'NEXT' });
    }, 1500); // Change tip every 1500 milliseconds
  
    getRandomTip(applicationId);
  
    setTimeout(() => {
      clearInterval(timerId);
    }, 6000); // Set loading time to 6000 milliseconds
  
    return () => {
      clearInterval(timerId);
    };
  }, [applicationId]);

  const getRandomTip = async (applicationId: number) => {
  try {
    const { data: tipsData, error } = await supabase.from('tips').select('*').eq('application_id', applicationId);

    if (error) {
      console.error('Error fetching tips:', error.message);
      return;
    }

    if (!tipsData) {
      console.log('No tips found.');
      return;
    }

    const tips: Tip[] = tipsData as Tip[];
    dispatch({ type: 'RESET', payload: tips });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching tips:', error.message);
    } else {
      console.error('An error occurred while fetching tips.');
    }
  }
};


  return (
    <Box textAlign="center" padding="2rem">
      <Spinner size="xl" mb="2rem" />
      <Heading size="xl">Loading...</Heading>
      <Heading size="md" mt="2rem">
        Tip: {state.currentTip?.content || ''}
      </Heading>
    </Box>
  );
};

export default LoadingPage;
