const graphql = require('graphql');
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
    GraphQLNonNull
} = graphql;

const BookType = new GraphQLObjectType({
    name: 'Book',
    fields: ( ) => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        genre: { type: GraphQLString },
        author: {
            type: AuthorType,
            resolve(parent, args){
                return prisma.author.findUnique({where:{id:parent.authorId}});
            }
        }
    })
});

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args){
                return prisma.book.findMany({where:{ authorId: parent.id }});
            }
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        book: {
            type: BookType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args){
                return prisma.book.findUnique({where:{id:args.id}});
            }
        },
        author: {
            type: AuthorType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args){
                return prisma.author.findUnique({where:{id:args.id}});
            }
        },
        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args){
                return prisma.book.findMany({});
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            resolve(parent, args){
                return prisma.author.findMany({});
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addAuthor: {
            type: AuthorType,
            args: {
                name: { type: GraphQLString },
                age: { type: GraphQLInt }
            },
            resolve:async(parent, args)=>{
                let author = await prisma.author.create({data:{
                    name: args.name,
                    age: args.age
                }});
                return author;
            }
        },
        addBook: {
            type: BookType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                genre: { type: new GraphQLNonNull(GraphQLString) },
                authorId: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve:async(parent, args)=>{
                let book=  await prisma.book.create({data:{
                    name: args.name,
                    genre: args.genre,
                    authorId: args.authorId
                }});
                return book;
            }
        },
        deleteAuthor: {
            type: AuthorType,
            args: {
              id: { type: GraphQLID }
            },
            resolve:async(parent, args) =>{
              return await prisma.author.delete({where:{id:args.id}});
            }
        },
        deleteBook: {
            type: BookType,
            args: {
              id: { type: GraphQLID }
            },
            resolve:async(parent, args)=> {
              return await prisma.book.delete({where:{id:args.id}});
            }
        },
        updateAuthor: {
            type: AuthorType,
            args: {
              id: { type: GraphQLID },
              name:{type:GraphQLString}
            },
            resolve:async(parent, args) =>{
              return await prisma.author.update({where:{id:args.id},data:{name:args.name}});
            }
        },
        updateBook: {
            type: BookType,
            args: {
              id: { type: GraphQLID },
              name:{type:GraphQLString}
            },
            resolve:async(parent, args)=> {
              return await prisma.book.update({where:{id:args.id},data:{name:args.name}});
            
            }
        },
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});