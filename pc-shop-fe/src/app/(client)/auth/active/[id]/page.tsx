'use client';

import { useParams } from 'next/navigation';
import ActiveAccount from '@/components/auth/active-account';

function ActivePage() {
    const params = useParams();
    const id = params.id as string;

    return (
        <div>
            <div>ID: {id}</div>
            <ActiveAccount id={id} />
        </div>
    );
}

export default ActivePage;