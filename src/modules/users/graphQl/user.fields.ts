import { GraphQLList } from "graphql";
import { userType } from "./user.type";
import { deleteUserDataArgs, getuserDataArgs, updateProfileArgs } from "./user.args";
import userService from "../user.service";

class UserFields {
    constructor() { }

    userQuery = () => {
        return {
            getUserData: {
                type: userType,
                args: getuserDataArgs,
                resolve: (parent: any, args: any) => {
                    return userService.getuserDataResolver(parent, args)
                }

            },
            getAllUsers: {
                type: new GraphQLList(userType),
                resolve: (parent: any, args: any, context: any) => {
                
                    return userService.getAlluserResolver(context.req.raw.user._id)

            }}
        }
    }

    userMutation = () => {
        return {
            updateProfile: {
                type: userType,
                args: updateProfileArgs,
                resolve: (parent: any, args: any) => {
                    return userService.updateProfileResolver(parent, args)
                }

            },
            deleteUserData: {
                type: userType,
                args: deleteUserDataArgs,
                resolve: (parent: any, args: any) => {
                    return userService.deleteUserDataResolver(parent, args)
                }
            }
        }
    }
}

export default new UserFields();