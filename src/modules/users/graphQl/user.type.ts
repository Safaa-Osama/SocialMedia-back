import { GraphQLEnumType, GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLString, GraphQLObjectType } from "graphql";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../../Common/enum/userEnum";

export const GenderGraphQL = new GraphQLEnumType({
    name: "GenderEnum",
    values: {
        male: { value: GenderEnum.male },
        female: { value: GenderEnum.female },
    },
});

export const RoleGraphQL = new GraphQLEnumType({
    name: "RoleEnum",
    values: {
        user: { value: RoleEnum.user },
        admin: { value: RoleEnum.admin },
    },
});

export const ProviderGraphQL = new GraphQLEnumType({
    name: "ProviderEnum",
    values: {
        google: { value: ProviderEnum.google },
        system: { value: ProviderEnum.system },
    },
});

export const userType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        _id: { type: GraphQLID },
        email: { type: GraphQLString },
        firstName: { type: GraphQLString },
        password: { type: GraphQLString },
        phone: { type: GraphQLString },
        lastName: { type: GraphQLString },

        gender: {
            type: GenderGraphQL,
        },

        role: {
            type: RoleGraphQL,
        },

        provider: {
            type: ProviderGraphQL,
        },

    confirmed: { type: GraphQLBoolean },
    coverPics: { type: new GraphQLList(GraphQLString) },
    profilePic: { type: GraphQLString },
    age: { type: GraphQLInt },
    }),
});