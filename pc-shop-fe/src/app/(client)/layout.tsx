import ClientFooter from "@/components/footer/client-footer";
import ClientHeader from "@/components/header/client-header";
import { MessengerIcon } from "@/components/MessengerIcon";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <header>
                <ClientHeader />
            </header>
            <main>
                {children}
            </main>
            <ClientFooter />
            <MessengerIcon />
        </>
    )
}
