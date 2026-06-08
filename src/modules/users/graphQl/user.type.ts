import { GraphQLEnumType, GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLString } from "graphql";
import { GenderEnum,ProviderEnum,RoleEnum } from "../../../Common/enum/userEnum";

export const userType = {
                        _id: { type: GraphQLID },
                        email: { type: GraphQLString },
                        firstName: { type: GraphQLString },
                        password: { type: GraphQLString },
                        phone: { type: GraphQLString },
                        lastName: { type: GraphQLString },
                        gender: {
                            type: new GraphQLEnumType({
                                name: "GenderEnum",
                                values: {
                                    male: { value: GenderEnum.male },
                                    female: { value: GenderEnum.female }
                                }
                            })
                        },
                        role: {
                            type: new GraphQLEnumType({
                                name: "RoleEnum",
                                values: {
                                    user: { value: RoleEnum.user },
                                    admin: { value: RoleEnum.admin }
                                }
                            })
                        },
                        provider: {
                            type: new GraphQLEnumType({
                                name: "ProviderEnum",
                                values: {
                                    google: { value: ProviderEnum.google },
                                    system: { value: ProviderEnum.system }
                                }
                            })
                        },
                        confirmed: { type: GraphQLBoolean },
                        coverPics: { type: new GraphQLList(GraphQLString) },
                        profilePic: { type: GraphQLString },
                        age: { type: GraphQLInt },
                    }    