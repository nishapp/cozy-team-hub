
import { HeroWithMockup } from "@/components/blocks/hero-with-mockup"
import { Icons } from "@/components/ui/icons"

export function HeroDemo() {
  return (
    <HeroWithMockup
      title="Share Your Learning Journey"
      description="Bookmark, categorize, and share what you learn. Transform knowledge into compelling short-form videos."
      primaryCta={{
        text: "Get Started",
        href: "/auth",
      }}
      secondaryCta={{
        text: "View Features",
        href: "#features",
        icon: <Icons.gitHub className="mr-2 h-4 w-4" />,
      }}
      mockupImage={{
        alt: "WDYLT Platform Preview",
        width: 1248,
        height: 765,
        src: "https://placehold.co/1200x800/e2e8f0/a1a1aa?text=WDYLT+Dashboard"
      }}
    />
  )
}
