import { SendButton } from "@/components/experiments/send-button/SendButton";
import ThemeSwitch from "@/components/experiments/send-button/ThemeSwitch";

export default function Page() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center gap-12 bg-gradient-to-br from-slate-50 to-slate-100 transition-colors duration-500 dark:from-zinc-950 dark:to-black">
      <ThemeSwitch />
      <SendButton />
    </div>
  );
}
