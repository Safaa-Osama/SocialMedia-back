import { GraphQLObjectType, GraphQLSchema } from "graphql";
import UserFields from "../users/graphQl/user.fields";


const gqlschema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "querySchema",
        fields: {
            ...UserFields.userQuery()
        }
    }),
    mutation: new GraphQLObjectType({
        name: "mutationSchema",
        fields: {
            ...UserFields.userMutation()
        }
    })
})


export default gqlschema;