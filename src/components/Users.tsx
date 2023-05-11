import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const [checkedUsers, setCheckedUsers] = useState(new Set<number>());

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

        // Filter out the persona with the name "general"
        const filteredPersonas = (personas as Persona[]).filter(
          (persona: Persona) => persona.name.toLowerCase() !== 'general'
        );
        

        setUsersList(filteredPersonas as Persona[]);
      } catch (error) {
        console.error('Error fetching personas:', error);
      }
    };

    if (applicationId) {
      fetchPersonas();
    }
  }, [applicationId]);

  useEffect(() => {
    setCheckedUsers(new Set<number>(usersList.map((user: Persona) => user.id)));
  }, [usersList]);

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

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>For that, our users will be:</h1>

      <div className={styles.usersGrid}>
        {usersList.map((user: Persona) => (
          <div key={user.id} className={styles.userCard}>
            <button
              className={styles.checkButton}
              onClick={() => handleCheckToggle(user.id)}
            >
              <FontAwesomeIcon
                icon={faCheck}
                className={
                  checkedUsers.has(user.id) ? styles.checked : styles.unchecked
                }
              />
            </button>
            <img
              src={user.icon}
              alt={user.name}
              className={`${styles.userIcon} ${
                checkedUsers.has(user.id) ? '' : styles.grayedOut
              }`}
            />
            <p className={styles.userName}>{user.name}</p>
          </div>
        ))}
      </div>

      <div className={styles.navigationButtons}>
        <button className={styles.backButton} onClick={handleBackClick}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
        <button
          className={styles.nextButton}
          onClick={() => {

// Find the corresponding persona objects for the selected persona IDs and filter out undefined values
const selectedPersonas = Array.from(checkedUsers).map((id) => usersList.find((user) => user.id === id)).filter((p): p is Persona => !!p);

// Navigate to the UserNeeds page with the selected persona IDs
navigate('/userneeds', { state: { selectedPersonaIds: selectedPersonas.map(p => p.id), prompt } });


          }}
          disabled={checkedUsers.size === 0}
          >
          Next <FontAwesomeIcon icon={faArrowRight} />
          </button>
          </div>
          </div>
          );
          };
          
          export default Users;
