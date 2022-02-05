const graphql = require("graphql");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  rejectOnNotFound: {
    findUnique: true,
  },
});

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
} = graphql;


const BookType = new GraphQLObjectType({
  name: "Book",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    genre: { type: GraphQLString },
    author: {
      type: AuthorType,
      resolve: async (parent, args) => {
        return await prisma.author.findUnique({
          where: { id: parent.authorId },
        });
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    books: {
      type: new GraphQLList(BookType),
      resolve: async (parent, args) => {
        return await prisma.book.findMany({ where: { authorId: parent.id } });
      },
    },
  }),
});

const ResultType = new GraphQLObjectType({
  name: "ResultType",
  fields: () => ({
     data :{
       type:AuthorType,
       type:BookType
    },
    //data: { type: AuthorType},
    status: { type: GraphQLInt },
    message: { type: GraphQLString },
    error: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    book: {
      type: ResultType,
      args: { id: { type: GraphQLID } },
      resolve: async (parent, args) => {
        try {
          const book = await prisma.book.findUnique({ where: { id: args.id } });
          if (book) {
            return {
              data: book,
              status: 200,
            };
          } else {
            return { status: 404, error: "Book Not Found" };
          }
        } catch (error) {
            return { status: 500, error: "Server Error" };
        }
      },
    },


    author: {
      type: ResultType,
      args: { id: { type: GraphQLID } },
      resolve: async (parent, args) => {
          try {
              const author = await prisma.author.findUnique({ where: { id: args.id } });
              if (author) {
                return {
                  data: author,
                  status: 200,
                };
              } else {
                return { status: 404, error: "Author Not Found" };
              }
            } catch (error) {
                return { status: 500, error: "Server Error" };
            } 
      },
    },


    books: {
      type: new GraphQLList(BookType),
      resolve: async (parent, args) => {
        return await prisma.book.findMany({});
      },
    },
    authors: {
      type: new GraphQLList(AuthorType),
      resolve: async (parent, args) => {
        return await prisma.author.findMany({});
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addAuthor: {
      type: AuthorType,
      args: {
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
      },
      resolve: async (parent, args) => {
        let author = await prisma.author.create({
          data: {
            name: args.name,
            age: args.age,
          },
        });
        return author;
      },
    },
    addBook: {
      type: ResultType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLID) },
      },

      resolve: async (parent, args) => {
        try {
          let book = await prisma.book.create({
            data: {
              name: args.name,
              genre: args.genre,
              authorId: args.authorId,
            },
          });
          if (book) {
            return { status: "SUCCESS", node: book };
          } else {
            return { status: "FAILED", message: "Can't Create" };
          }
        } catch (error) {
          return { status: "ERROR", message: e.message };
        }
      },
    },
    deleteAuthor: {
      type: AuthorType,
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        return await prisma.author.delete({ where: { id: args.id } });
      },
    },
    deleteBook: {
      type: BookType,
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        return await prisma.book.delete({ where: { id: args.id } });
      },
    },
    updateAuthor: {
      type: AuthorType,
      args: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        return await prisma.author.update({
          where: { id: args.id },
          data: { name: args.name },
        });
      },
    },
    updateBook: {
      type: BookType,
      args: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        return await prisma.book.update({
          where: { id: args.id },
          data: { name: args.name },
        });
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
