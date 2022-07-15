import { useQuery, useMutation } from "@apollo/client";
import { useState } from "react";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";

const AuthorEditor = () => {
  const [name, setName] = useState("");
  const [born, setBorn] = useState("");
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      console.log("Got error", error.graphQLErrors[0].message);
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Handling submit with", name, born);
    const bornNumber = parseInt(born);

    editAuthor({ variables: { name: name, setBornTo: bornNumber } });

    setName("");
    setBorn("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        name
        <input
          type={"text"}
          value={name}
          onChange={({ target }) => setName(target.value)}
        ></input>
      </div>
      <div>
        born
        <input
          type={"number"}
          value={born}
          onChange={({ target }) => setBorn(target.value)}
        ></input>
      </div>
      <div>
        <button>update author</button>
      </div>
    </form>
  );
};

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS);

  if (!props.show || result.loading) {
    return null;
  }
  const authors = result.data.allAuthors;

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <AuthorEditor />
    </div>
  );
};

export default Authors;
