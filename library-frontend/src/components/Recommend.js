import { useQuery } from "@apollo/client";
import { ME, ALL_BOOKS } from "../queries";

const Recommend = ({ show }) => {
  const meResult = useQuery(ME);
  const bookResult = useQuery(ALL_BOOKS);
  const username = meResult.data.me.username;
  const favoriteGenre = meResult.data.me.favoriteGenre;
  const recommendedBooks = bookResult.data.allBooks.filter((b) =>
    b.genres.includes(favoriteGenre)
  );
  if (meResult.loading || !show) {
    return null;
  }
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
