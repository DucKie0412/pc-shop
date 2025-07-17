import ClientFooter from "@/components/footer/client-footer";
import ClientHeader from "@/components/header/client-header";
import ChatbotIcon from "@/components/ChatbotIcon";
import { MessengerIcon } from "@/components/MessengerIcon";
import ScrollToTopButton from "@/components/ScrollToTopButton";

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
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
                <ChatbotIcon />
                <MessengerIcon />
                <ScrollToTopButton />
            </div>
        </>
    )
}
