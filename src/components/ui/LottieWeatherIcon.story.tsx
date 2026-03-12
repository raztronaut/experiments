import { defineStory } from "@/lib/story";
import { LottieWeatherIcon } from "./LottieWeatherIcon";

export const story = defineStory(import.meta.url, {
  Component: LottieWeatherIcon,
  args: [
    { variant: "Clear Day", initial: { code: 0, isNight: false } },
    { variant: "Clear Night", initial: { code: 0, isNight: true } },
    { variant: "Cloudy", initial: { code: 3, isNight: false } },
    { variant: "Rain", initial: { code: 61, isNight: false } },
    { variant: "Snow", initial: { code: 71, isNight: false } },
    { variant: "Thunderstorm", initial: { code: 95, isNight: false } },
  ],
});
