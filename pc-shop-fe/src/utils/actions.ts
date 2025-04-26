'use server';

import { signIn } from "@/auth";

export async function authenticate(username: string, password: string) {
    try {
        const data = await signIn("credentials", {
            username,
            password,
            // callbackUrl: "/",
            redirect: false
        });

        if (!data || data.error) {
            return { error: "Data error: " + data.error };
        }

        return data;
    } catch (error: any) {
        console.log("Error in authenticate: ", error);

        // check type of error and send to client through toast
        if (error.name === "InvalidEmailPasswordError") {
            return {
                error: "Incorrect email or password!",
                code: 1
            };
        } else if (error.name === "InactiveAccountError") {
            return {
                error: "Your account has not been activated yet!",
                code: 2
            };
        } else {
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }
}
