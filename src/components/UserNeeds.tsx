import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  ListItem,
  UnorderedList,
  Avatar,
  VStack,
  HStack,
  Text,
  Checkbox,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Flex,
  Button,
  Center
} from '@chakra-ui/react';
import { AddIcon, EditIcon, CheckIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';
import supabase from '../config/supabaseClient';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface UserNeedsProps {
  selectedPersonas: string[];
  prompt: string;
}
interface Need {
  id: number;
  persona_id: number;
  desc: string;
}

interface GroupedNeeds {
  [key: string]: {
    icon: string;
    needs: Need[];
  };
}

const UserNeeds: React.FC<UserNeedsProps> = ({ selectedPersonas, prompt }) => {
  const [needsData, setNeedsData] = useState<any[]>([]);
  const [personasData, setPersonasData] = useState<any[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [editingNeedIndex, setEditingNeedIndex] = useState<{ [key: number]: number | null }>({});
  const [addingNeedIndex, setAddingNeedIndex] = useState<{ [key: number]: number | null }>({});
  const [inputValue, setInputValue] = useState<string>('');
  const [generalPersonaId, setGeneralPersonaId] = useState<number | null>(null);
  

  useEffect(() => {
    const fetchGeneralPersonaId = async () => {
      const { data: personas } = await supabase
        .from('personas')
        .select('id')
        .eq('name', 'general')
        .limit(1);

      if (personas && personas.length > 0) {
        setGeneralPersonaId(personas[0].id);
      }
    };

    fetchGeneralPersonaId();
  }, []);

  useEffect(() => {
    const fetchPersonas = async () => {
      const { data: personas } = await supabase.from('personas').select('*');
      if (personas) setPersonasData(personas);
    };

    fetchPersonas();
  }, []);

  useEffect(() => {
    if (generalPersonaId) {
      const selectedPersonaIds = location.state?.selectedPersonaIds || [];
      const fetchNeeds = async (selectedPersonaIds: number[]) => {
        const { data: needs } = await supabase
          .from('needs')
          .select('*')
          .in('persona_id', [...selectedPersonaIds, generalPersonaId]);

        if (needs) setNeedsData(needs);
      };

      fetchNeeds(selectedPersonaIds);
    }
  }, [location.state, generalPersonaId, needsData]);

  const addNeedInServer = async (newNeed: any) => {
    const { data: countData, count } = await supabase.from('needs').select('id', { count: 'exact' });
    const { data: maxIdData } = await supabase.from('needs').select('id').order('id', { ascending: false }).limit(1);
    const maxId = maxIdData?.[0]?.id || 0;
    const newId = maxId + 1;

    console.log('newId', newId);
    console.log('countData', countData);

    const { data: insertedNeed } = await supabase
      .from('needs')
      .insert([{ id: newId, persona_id: newNeed.persona_id, desc: newNeed.desc }]);

      if (insertedNeed) {
        setNeedsData((prevNeedsData) => [...prevNeedsData, insertedNeed[0]]);
      }
      
  };

  

  const editNeedInServer = async (needId: number, updatedDesc: string, personaId: number) => {
    const { error } = await supabase
      .from('needs')
      .update({ desc: updatedDesc })
      .eq('id', needId);
  
    if (error) {
      console.error('Error updating need description:', error);
    } else {
      setNeedsData((prevNeedsData) =>
        prevNeedsData.map((need) =>
          need.id === needId ? { ...need, desc: updatedDesc } : need
        )
      );
      setEditingNeedIndex({ ...editingNeedIndex, [personaId]: null });
      setInputValue('');
    }
  };
  
  

  const getPersonaData = (personaId: number) => {
    return personasData.find((persona) => persona.id === personaId);
  };
  
  const groupedNeeds = React.useMemo(() => {
    
    return needsData.reduce((acc, need) => {
      const personaData = getPersonaData(need.persona_id);
      if (personaData) {
        if (!acc[personaData.name]) {
          acc[personaData.name] = { needs: [], icon: personaData.icon };
        }
        acc[personaData.name].needs.push(need);
      }
      return acc;
    }, {} as { [key: string]: { needs: any[]; icon: string } });
  }, [needsData]);

  const handleBackClick = () => {
    navigate(-1);
  };


  return (
    <div>
      <Box mt={8} mx="auto" maxW="800px" color="white">
        <Heading mb={50}>User Needs</Heading>
        <VStack align="start" spacing={4}>
          {groupedNeeds.general && groupedNeeds.general.needs.length > 0 && (
            <>
              <Text as="span" fontSize="lg" fontWeight="bold">
                All the users will need to:
              </Text>
              <UnorderedList>
                {groupedNeeds.general.needs.map((need: Need) => (
                  <ListItem key={need.id}>
                    <Checkbox defaultChecked>{need.desc}</Checkbox>
                  </ListItem>
                ))}
              </UnorderedList>
            </>
          )}
          {Object.entries(groupedNeeds)
            .filter(([personaName]) => personaName !== 'general')
            .map(([personaName, personaData]) => (
              
              <Box key={personaName}>
                <HStack>
                  <Avatar 
                  src={(personaData as GroupedNeeds[string]).icon}
                    size="lg" 
                   marginLeft="-15px"
                   transform="translateY(75px)"
                    />
                  
                </HStack>
                <UnorderedList pl={70} ml={4} >
                <Text fontSize="lg" fontWeight="bold" mb="1.5rem">
                    {personaName} will need to:
                  </Text>
                  
                  {(personaData as GroupedNeeds[string]).needs.map((need: Need, needIndex: number) => (
                    <ListItem key={need.id} >
                      {editingNeedIndex[need.persona_id] === needIndex ? (
                         <form
                         onSubmit={(e) => {
                           e.preventDefault();
                           editNeedInServer(need.id, inputValue, need.persona_id);
                         }}
                       >
                        <InputGroup size="sm">
                          <Input
                            value={inputValue}
                            transform="translateY(-10px)"
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Edit need description"
                          />
                          <InputRightElement>
                            <IconButton
                            size="xs"
                              transform={'translateX(61px) translateY(-10px)'}
                              aria-label="Save edited need"
                              
                              icon={<CheckIcon w={3.5} h={3.5} color="green.500"/>}
                             type="submit"
                            />
                          </InputRightElement>
                        </InputGroup>
                        </form>
                      ) : (
                        <>
                        
                          <Checkbox defaultChecked>{need.desc}</Checkbox>
                          <Flex alignItems="center">
                          <IconButton
                          transform= {'translateX(320px) translateY(-18px)'}
                           size="xs"
                            aria-label="Edit need" 
                            icon={<EditIcon w={3.5} h={3.5} color="red.500" />}
                            onClick={() => {
                              setInputValue(need.desc);
                              setEditingNeedIndex({ ...editingNeedIndex, [need.persona_id]: needIndex });
                            }}
                            
                          />
                          </Flex>
                          
                        </>
                        
                      )}
                    </ListItem>
                  ))}
                  {addingNeedIndex[(personaData as GroupedNeeds[string]).needs[0].persona_id] === (personaData as GroupedNeeds[string]).needs.length && (
                    <ListItem>
                      <InputGroup size="sm">
                        <Input
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Add new need description"
                        />
                        <InputRightElement>
                          <IconButton
                            size="xs"
                            aria-label="Save new need"
                            icon={<CheckIcon w={3.5} h={3.5} color="green.500"/>}
                            onClick={() => {
                              addNeedInServer({ persona_id:   
                              (personaData as GroupedNeeds[string]).needs[0].persona_id , desc: inputValue });
                              setInputValue('');
                              setAddingNeedIndex({ ...addingNeedIndex, [(personaData as GroupedNeeds[string]).needs[0].persona_id]: null});
                            }}
                          />
                        </InputRightElement>
                      </InputGroup>
                    </ListItem>
                  )}
                  <ListItem>
                    <IconButton
                      size="xs"
                      aria-label="Add need"
                      icon={<AddIcon w={3.5} h={3.5} color="green.500"/> }
                      onClick={() => {
                        setInputValue('');
                        setAddingNeedIndex({ ...addingNeedIndex, [(personaData as GroupedNeeds[string]).needs[0].persona_id]: (personaData as GroupedNeeds[string]).needs.length });
                      }}
                    />
                  </ListItem>
                </UnorderedList>
              </Box>
            ))}
        </VStack>
        
        </Box>
        <Center mt={6}>
        <Button
          onClick={handleBackClick}
          mx={200}
          bg="#7a7a7a"
          color="white"
          px={4}
          py={2}
          marginTop={100}
          
          alignItems={'center'}
          borderRadius="4px"
          textDecoration="none"
          fontSize="1.2rem"
          _hover={{ bg: "#4c4c4c" }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />    
           Back
        </Button>
        <Button
          as={Link}
          to="/prompt_result"
          mx={200}
          bg="#62d667"
          color="white"
          px={4}
          py={2}
          marginTop={100}
          
          alignItems={'center'}
          borderRadius="4px"
          textDecoration="none"
          fontSize="1.2rem"
          _hover={{ bg: "#3aa53a" }}
        >
          Next<FontAwesomeIcon icon={faArrowRight} />
        </Button>
      </Center>
  </div>
  
  );

};

export default UserNeeds;