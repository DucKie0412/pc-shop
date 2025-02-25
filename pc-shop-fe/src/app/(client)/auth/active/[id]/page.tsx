import ActiveAccount from '@/components/auth/active-account';

function ActivePage({ params }: { params: { id: string } }) {
    const {id} = params;
    return (

        <div>
            <div>ID: {id}</div>
            <ActiveAccount id={id} />
        </div>
    )
}

export default ActivePage