import { SendButton } from "@/components/experiments/send-button/SendButton";
import ThemeSwitch from "@/components/experiments/send-button/ThemeSwitch";

export default function Page() {
    return (
        <div className="w-full min-h-screen relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-black transition-colors duration-500 flex flex-col justify-center items-center gap-12">
            <ThemeSwitch />
            <SendButton />
        </div>
    );
}