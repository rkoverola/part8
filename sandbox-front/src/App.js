import { useApolloClient, useQuery, useSubscription } from "@apollo/client";
import { useState } from "react";

import Persons from "./components/Persons";
import PersonForm from "./components/PersonForm";
import { ALL_PERSONS, PERSON_ADDED } from "./queries";
import PhoneForm from "./components/PhoneForm";
import LoginForm from "./components/LoginForm";

export const updateCache = (cache, query, addedPerson) => {
  // NOTE: This function is weirdly complicated in material, fix if issues
  const uniqueByName = (persons) => {
    const seen = new Set();
    return persons.filter((person) => {
      return seen.has(person.name) ? false : seen.add(person.name);
    });
  };
  cache.updateQuery(query, ({ allPersons }) => {
    return {
      allPersons: uniqueByName(allPersons.concat(addedPerson)),
    };
  });
};

const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null;
  }
  return <div style={{ color: "crimson" }}>{errorMessage}</div>;
};

const App = () => {
  const result = useQuery(ALL_PERSONS);
  const [errorMessage, setErrorMessage] = useState(null);
  const [token, setToken] = useState(null);
  const client = useApolloClient();

  useSubscription(PERSON_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedPerson = subscriptionData.data.personAdded;
      notify(`${addedPerson.name} added`);
      updateCache(client.cache, { query: ALL_PERSONS }, addedPerson);
    },
  });

  if (result.loading) {
    return <div>Loading...</div>;
  }

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
  };

  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000);
  };

  if (!token) {
    return (
      <div>
        <Notify errorMessage={errorMessage} />
        <h2>Login</h2>
        <LoginForm setToken={setToken} setError={notify} />
      </div>
    );
  }

  return (
    <div>
      <Notify errorMessage={errorMessage} />
      <button onClick={logout}>Logout</button>
      <Persons persons={result.data.allPersons} />
      <PersonForm setError={notify} />
      <PhoneForm setError={notify} />
    </div>
  );
};

export default App;
