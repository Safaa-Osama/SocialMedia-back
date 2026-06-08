import { GraphQLID, GraphQLString } from "graphql";


export const getuserDataArgs = {

    id: { type: GraphQLID }
}

export const updateProfileArgs = {

    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString }

}

export const deleteUserDataArgs = {

    id: { type: GraphQLID }
}