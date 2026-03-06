import MountainTransition from "@/components/experiments/mountain-transition/MountainTransition";

export const metadata = {
  title: "Mountain Transition | Experiments",
  description: "A shader-based morphing mountain landscape.",
};

export default function Page() {
  return (
    <main className="h-full min-h-screen w-full bg-black">
      <MountainTransition />
    </main>
  );
}
