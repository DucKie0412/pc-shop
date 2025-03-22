import { auth } from '@/auth';
import React from 'react';

const DashboardPage = async () => {

    const session = await auth();    

    if(session?.user){
        return (
            <div style={{ display: 'flex' }}>
                <div style={{ marginLeft: '20px', flex: 1 }}>
                    <h1>Dashboard for ADMIN ROLE</h1>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ marginLeft: '20px', flex: 1 }}>
                <div>{JSON.stringify(session)}</div>
                <h1>Dashboard for USER ROLE</h1>
            </div>
        </div>
    );

    
};

export default DashboardPage;