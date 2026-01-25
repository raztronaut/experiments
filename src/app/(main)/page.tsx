import { getExperiments } from '@/lib/experiments';
import { ExperimentDrawerList } from '@/components/ui/ExperimentDrawerList';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { AIWidget } from '@/components/ui/AIWidget';
import { Waves } from '@/components/ui/wave-background';
import { Github, ArrowUpRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const experiments = await getExperiments();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 -top-20 z-0 h-[500px] w-full overflow-hidden opacity-40 mask-image-gradient pointer-events-none">
        <Waves
          className="w-full h-full"
          strokeColor="rgba(255,255,255,0.2)"
          backgroundColor="transparent"
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>
      <main className="flex-1 p-8 pt-40 md:p-24 md:pt-64 max-w-4xl mx-auto w-full">
        <div className="mb-12 relative z-10">

          <h1 className="text-2xl font-semibold tracking-tight mb-2 relative">Razi&apos;s Experiments</h1>
          <p className="text-muted-foreground relative">
            This page is created using my simple scaffolding tool to help developers whip up new web design/development experiments rapidly. Check it out here:{' '}
            <a
              href="https://github.com/raztronaut/experiments-tool"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-primary transition-colors"
              data-umami-event="github_click"
              data-umami-event-type="repo"
            >
              <Github className="h-4 w-4" />
              <span>experiments-tool</span>
              <ArrowUpRight className="h-3 w-3 opacity-60" />
            </a>
          </p>
          <p className="mt-2 text-sm text-[#14b8a6] md:hidden relative">
            Swipe &lt;- or -&gt; on mobile in a card to view a preview.
          </p>
          <p className="mt-2 text-sm text-[#14b8a6] md:hidden relative">
            But visit the experiments on desktop for best experience!
          </p>
        </div>

        <ExperimentDrawerList experiments={experiments} />
      </main>
      <div className="max-w-4xl mx-auto w-full px-8 md:px-24">
        <SiteFooter />
      </div>
      <AIWidget />
    </div>
  );
}
