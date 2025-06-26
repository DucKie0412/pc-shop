import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { InactiveAccountError, InvalidEmailPasswordError } from "./utils/errors";
import { sendRequest } from "./utils/api";
import { IUser } from "./types/next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            credentials: {
                username: {},
                password: {},
            },
            authorize: async (credentials) => {
                const res = await sendRequest<IBackendRes<ILogin>>({
                    method: "POST",
                    url: `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
                    body: {
                        username: credentials.username,
                        password: credentials.password
                    }
                })

                //call backend to verify user
                //user exist
                if (+res.statusCode === 201) {
                    return {
                        _id: res.data?.user._id,
                        name: res.data?.user.name,
                        email: res.data?.user.email,
                        role: res.data?.user.role,
                        accessToken: res.data?.access_token,
                        points: res.data?.user.points
                    }
                }

                // incorrect email or password
                else if (+res.statusCode === 401) {
                    throw new InvalidEmailPasswordError()
                }

                // account is not active
                else if (+res.statusCode === 400) {
                    throw new InactiveAccountError()
                }

                else {
                    throw new Error("Internal Server Error")
                }
            }
        }),
    ],
    pages: {
        signIn: "/auth/login",
        signOut: "/",
    },
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                // Save user info in token
                token.user = user as IUser;
            }
            return token;
        },
        session({ session, token }) {
            // Attach user from token to session
            (session.user as IUser) = token.user;
            return session;
        },
    },
    session: {
        strategy: "jwt", // Bắt buộc để middleware lấy được session
    },
    trustHost: true
})