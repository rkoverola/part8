import { useState } from "react";
import { useQuery } from "@apollo/client";

import { ALL_BOOKS } from "../queries";

const AllGenresButton = (props) => {
  return (
    <button
      onClick={() => {
        props.setGenreFilter(null);
      }}
    >
      all genres
    </button>
  );
};

const GenreButton = (props) => {
  return (
    <button
      onClick={() => {
        props.setGenreFilter(props.name);
      }}
    >
      {props.name}
    </button>
  );
};

const Books = (props) => {
  const [genreFilter, setGenreFilter] = useState(null);

  const result = useQuery(ALL_BOOKS);

  if (!props.show || result.loading) {
    return null;
  }

  const books = result.data.allBooks;
  const filteredBooks = genreFilter
    ? books.filter((b) => b.genres.includes(genreFilter))
    : books;
  const genres = result.data.allBooks.flatMap((b) => b.genres);
  const uniqueGenres = [...new Set(genres)];
  const currentFilterText = genreFilter
    ? `showing: ${genreFilter}`
    : "all genres";
  console.log("Got books", books);
  console.log("Got genres", uniqueGenres);

  return (
    <div>
      <h2>books</h2>

      <h3>{currentFilterText}</h3>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {filteredBooks.map((b) => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>filter by genre</h3>
      <div>
        {uniqueGenres.map((g) => (
          <GenreButton key={g} name={g} setGenreFilter={setGenreFilter} />
        ))}
        <AllGenresButton setGenreFilter={setGenreFilter} />
      </div>
    </div>
  );
};

export default Books;
