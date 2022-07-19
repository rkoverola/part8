const {
  ApolloServer,
  gql,
  UserInputError,
  AuthenticationError,
} = require("apollo-server");
const mongoose = require("mongoose");
const { MONGODB_URI, JWT_SECRET } = require("./config");
const jwt = require("jsonwebtoken");
const Author = require("./models/Author");
const Book = require("./models/Book");
const User = require("./models/User");

console.log("Connecting to MongoDB");
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Connection failed: ", error.message);
  });

const typeDefs = gql`
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Author {
    name: String
    id: String
    born: Int
    bookCount: Int
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author]
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String]
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
  }
`;

const resolvers = {
  Author: {
    bookCount: async (root) => {
      const books = await Book.find({ author: root });
      return books.length;
    },
  },

  Query: {
    bookCount: async () => {
      return Book.collection.countDocuments();
    },
    authorCount: async () => {
      return Author.collection.countDocuments();
    },
    allBooks: async (root, args) => {
      const authorObject = await Author.findOne({ name: args.author });
      const authorFilter = args.author ? { author: authorObject } : {};
      const genreFilter = args.genre ? { genres: { $in: [args.genre] } } : {};
      const combinedFilter = { ...authorFilter, ...genreFilter };
      console.log("Combined filter is", combinedFilter);
      return Book.find(combinedFilter).populate("author").populate("genres");
    },
    allAuthors: async () => {
      return Author.find({});
    },
    me: async (root, args, context) => {
      return context.currentUser;
    },
  },

  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new AuthenticationError("Not logged in");
      }
      let existingAuthor = await Author.findOne({ name: args.author });
      if (!existingAuthor) {
        existingAuthor = new Author({ name: args.author, bookCount: 1 });
        try {
          await existingAuthor.save();
        } catch (error) {
          console.log("Caught error");
          throw new UserInputError(error.message, {
            invalidArgs: args,
          });
        }
      }
      const bookToSave = new Book({ ...args, author: existingAuthor });
      console.log("Saving book", bookToSave);
      try {
        await bookToSave.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
      return bookToSave;
    },
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new AuthenticationError("Not logged in");
      }
      const authorToEdit = await Author.findOne({ name: args.name });
      if (!authorToEdit) {
        return null;
      }
      authorToEdit.born = args.setBornTo;
      try {
        await authorToEdit.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
      return authorToEdit;
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      });

      try {
        await user.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });
      if (!user || args.password !== "pep_secret") {
        throw new UserInputError("Invalid username or password");
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      };
      return { value: jwt.sign(userForToken, JWT_SECRET) };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
