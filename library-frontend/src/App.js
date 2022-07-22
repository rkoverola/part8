import { useState } from "react";
import {
  useQuery,
  useMutation,
  useSubscription,
  useApolloClient,
} from "@apollo/client";

import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";
import Recommend from "./components/Recommend";

import { ALL_BOOKS, BOOK_ADDED } from "./queries";

const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null;
  }
  return <div style={{ color: "crimson" }}>{errorMessage}</div>;
};

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const client = useApolloClient();

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded;
      notify(`Added a new book: ${addedBook.title}`);
      client.cache.updateQuery(
        { query: ALL_BOOKS, variables: { genre: null } },
        ({ allBooks }) => {
          return {
            allBooks: allBooks.concat(addedBook),
          };
        }
      );
    },
  });

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

        <div>
          <button onClick={() => setPage("authors")}>authors</button>
          <button onClick={() => setPage("books")}>books</button>
          <button onClick={() => setPage("login")}>login</button>
        </div>

        <Authors show={page === "authors"} notify={notify} />
        <Books show={page === "books"} notify={notify} />
        <Login show={page === "login"} setToken={setToken} notify={notify} />
      </div>
    );
  }

  return (
    <div>
      <Notify errorMessage={errorMessage} />

      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        <button onClick={() => setPage("add")}>add book</button>
        <button onClick={() => setPage("recommend")}>recommend</button>
        <button onClick={logout}>logout</button>
      </div>

      <Authors show={page === "authors"} notify={notify} />
      <Books show={page === "books"} notify={notify} />
      <NewBook show={page === "add"} notify={notify} />
      <Recommend show={page === "recommend"} notify={notify} />
    </div>
  );
};

export default App;
