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

  const bookResult = useQuery(ALL_BOOKS, {
    variables: { genre: genreFilter },
  });
  const genreResult = useQuery(ALL_BOOKS, {
    variables: { genre: null },
  });

  if (!props.show || bookResult.loading || genreResult.loading) {
    return null;
  }

  // TODO: Probably could be done in some other way than having two separate queries
  const books = bookResult.data.allBooks;
  const genres = genreResult.data.allBooks.flatMap((b) => b.genres);
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
          {books.map((b) => (
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
