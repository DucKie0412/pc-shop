import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt"

interface IUser {
    _id: string;
    name: string;
    email: string;
    phone: string,
    address: string,
    accessToken: string,
    isActive: boolean,
    accountType: string;
    role: string;
    points: number;
}
declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        access_token: string;
        refresh_token: string;
        user: IUser;
        access_expire: number;
        error: string;
    }
}

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: IUser,
        access_token: string;
        refresh_token: string;
        access_expire: number;
        error: string;
    }


}