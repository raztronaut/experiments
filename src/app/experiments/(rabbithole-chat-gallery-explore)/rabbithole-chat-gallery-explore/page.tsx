'use client';

import RabbitholeChatGalleryExplore from "@/components/experiments/rabbithole-chat-gallery-explore/RabbitholeChatGalleryExplore";
import { MobileBlocker, useMobileBlocker } from "@/components/ui/MobileBlocker";

export default function Page() {
    const isMobile = useMobileBlocker();

    if (isMobile) {
        return <MobileBlocker />;
    }

    return (
        <div className="w-full h-screen bg-white">
            <RabbitholeChatGalleryExplore />
        </div>
    );
}