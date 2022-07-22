const { UserInputError, AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("./config");

const Author = require("./models/Author");
const Book = require("./models/Book");
const User = require("./models/User");

const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

const resolvers = {
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
      console.log("Calling allAuthors");
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
        existingAuthor = new Author({ name: args.author, bookCount: 0 });
        try {
          await existingAuthor.save();
        } catch (error) {
          console.log("Caught error");
          throw new UserInputError(error.message, {
            invalidArgs: args,
          });
        }
      }
      existingAuthor.bookCount = existingAuthor.bookCount + 1;
      const bookToSave = new Book({ ...args, author: existingAuthor });
      console.log("Saving book", bookToSave);
      try {
        await bookToSave.save();
        await existingAuthor.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
      pubsub.publish("BOOK_ADDED", { bookAdded: bookToSave });

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
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(["BOOK_ADDED"]),
    },
  },
};

module.exports = resolvers;
