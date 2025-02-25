"use client";

import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import React from "react";

function Homepage() {
    const { data: session, status } = useSession();
    return (
        <div>
            <h1>Homepage</h1>
            <p>Status: {status}</p>

            {status === "loading" && <p>Loading session...</p>}

            {status === "authenticated" ? (
                <div>
                    <p>Email: {session?.user?.email}</p>
                    <Button onClick={() => signOut()}>Sign out of session</Button>
                </div>
            ) : (
                <div>
                    <p>Not logged in</p>
                    <Button onClick={() => signIn()}>Sign in</Button>
                </div>
            )}
        </div>
    );
}

export default Homepage;
