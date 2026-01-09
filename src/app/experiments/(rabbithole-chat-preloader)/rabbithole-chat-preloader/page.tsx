'use client';

import RabbitholeChatPreloader from "@/components/experiments/rabbithole-chat-preloader/RabbitholeChatPreloader";
import { MobileBlocker, useMobileBlocker } from "@/components/ui/MobileBlocker";

export default function Page() {
    const isMobile = useMobileBlocker();

    if (isMobile) {
        return <MobileBlocker />;
    }

    return (
        <div className="w-full h-screen">
            <RabbitholeChatPreloader />
        </div>
    );
}