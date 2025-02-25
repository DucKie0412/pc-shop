
interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <div>
            <h1>Auth Layout</h1>
            <h2>Nhớ validate input trong 2 form (dùng Zod)</h2>
            {children}
        </div>
    );
}

export default AuthLayout;