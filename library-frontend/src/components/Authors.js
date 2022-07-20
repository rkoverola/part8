import { useQuery, useMutation } from "@apollo/client";
import { useState } from "react";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";
import Select from "react-select";

const AuthorEditor = ({ names, notify }) => {
  const options = names.map((n) => {
    return { value: n, label: n };
  });
  console.log("Got options", options);

  const [name, setName] = useState("");
  const [born, setBorn] = useState("");
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      notify("Got error", error.graphQLErrors[0].message);
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Handling submit with", name, born);
    const nameString = name.value;
    console.log("Namestring is", nameString);
    const bornNumber = parseInt(born);

    editAuthor({ variables: { name: nameString, setBornTo: bornNumber } });

    setName("");
    setBorn("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Select defaultValue={name} onChange={setName} options={options} />
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
      <h2>edit author</h2>
      <AuthorEditor names={authors.map((a) => a.name)} />
    </div>
  );
};

export default Authors;
