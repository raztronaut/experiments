import { getExperiments } from '@/lib/experiments';
import { ExperimentDrawerList } from '@/components/ui/ExperimentDrawerList';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { AIWidget } from '@/components/ui/AIWidget';
import { Github, ArrowUpRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const experiments = await getExperiments();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-8 md:p-24 max-w-4xl mx-auto w-full">
        <div className="mb-12">
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Razi&apos;s Experiments</h1>
          <p className="text-muted-foreground">
            This page is created using my simple scaffolding tool to help developers whip up new web design/development experiments rapidly. Check it out here:{' '}
            <a
              href="https://github.com/raztronaut/experiments-tool"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-primary transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>experiments-tool</span>
              <ArrowUpRight className="h-3 w-3 opacity-60" />
            </a>
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
