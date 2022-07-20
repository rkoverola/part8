import { useQuery } from "@apollo/client";
import { ME, ALL_BOOKS } from "../queries";

const Recommend = ({ show }) => {
  const meResult = useQuery(ME);

  // TODO: This will make atleast one query with null and another with correct genre?
  // How to optimize? Can't make queries within conditionals.
  const favoriteGenre = meResult.loading
    ? null
    : meResult.data.me.favoriteGenre;

  const bookResult = useQuery(ALL_BOOKS, {
    variables: { genre: favoriteGenre },
  });
  if (meResult.loading || bookResult.loading || !show) {
    return null;
  }

  const recommendedBooks = bookResult.data.allBooks;
  return (
    <div>
      <h2>recommendations</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {recommendedBooks.map((b) => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommend;
