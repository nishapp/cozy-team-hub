
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
        alt: "WDYLT Platform Dashboard",
        width: 1248,
        height: 765,
        src: "/lovable-uploads/bb5b13e9-98d3-46ea-92ea-a17b713ea2f4.png"
      }}
    />
  )
}
