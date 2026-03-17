"use client";

import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LottieWeatherIcon } from "@/components/ui/LottieWeatherIcon";
import { Separator } from "@/components/ui/separator";

export interface UIComponentPreviewEntry {
  component: ComponentType;
}

/**
 * Registry slug → preview component for UI components.
 * Add new entries here; export-component-preview-slugs.mjs derives the slug list
 * for the MDX generator so registry docs show a live Preview section.
 */
export const UI_COMPONENT_PREVIEWS: Record<string, UIComponentPreviewEntry> = {
  badge: {
    component() {
      return (
        <div className="flex flex-wrap gap-2 p-6">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      );
    },
  },
  button: {
    component() {
      return (
        <div className="flex flex-wrap gap-2 p-6">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      );
    },
  },
  card: {
    component() {
      return (
        <div className="p-6">
          <Card className="w-[340px]">
            <CardHeader>
              <CardTitle>Card title</CardTitle>
              <CardDescription>Card description goes here.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Preview of the card component with header and content.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    },
  },
  "lottie-weather-icon": {
    component() {
      return (
        <div className="flex flex-wrap items-center justify-center gap-6 p-8">
          <div className="flex flex-col items-center gap-2">
            <LottieWeatherIcon code={0} isNight={false} />
            <span className="text-muted-foreground text-xs">Clear day</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LottieWeatherIcon code={0} isNight={true} />
            <span className="text-muted-foreground text-xs">Clear night</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LottieWeatherIcon code={61} isNight={false} />
            <span className="text-muted-foreground text-xs">Rain</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LottieWeatherIcon code={73} isNight={false} />
            <span className="text-muted-foreground text-xs">Snow</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LottieWeatherIcon code={95} isNight={false} />
            <span className="text-muted-foreground text-xs">Thunderstorm</span>
          </div>
        </div>
      );
    },
  },
  separator: {
    component() {
      return (
        <div className="flex w-full max-w-md flex-col gap-4 p-6">
          <div>
            <h4 className="mb-2 font-medium text-foreground text-sm">
              Horizontal
            </h4>
            <Separator />
          </div>
          <div className="flex h-20 items-center gap-4">
            <h4 className="font-medium text-foreground text-sm">Vertical</h4>
            <Separator orientation="vertical" />
            <span className="text-muted-foreground text-sm">Content</span>
          </div>
        </div>
      );
    },
  },
};

export const COMPONENT_PREVIEW_SLUGS = Object.keys(UI_COMPONENT_PREVIEWS);
