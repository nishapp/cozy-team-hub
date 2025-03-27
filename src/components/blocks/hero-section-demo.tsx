
import { HeroSection } from "@/components/blocks/hero-section";
import { Icons } from "@/components/ui/icons";

export function HeroSectionDemo() {
  return (
    <HeroSection
      badge={{
        text: "Introducing WDYLT",
        action: {
          text: "Learn more",
          href: "#features",
        },
      }}
      title="Share Your Learning Journey"
      description="Bookmark, categorize, and share what you learn. Transform knowledge into compelling short-form videos."
      actions={[
        {
          text: "Get Started",
          href: "/auth",
          variant: "default",
        },
        {
          text: "View Features",
          href: "#features",
          variant: "outline",
        },
      ]}
      image={{
        src: "https://placehold.co/1200x800/e2e8f0/a1a1aa?text=WDYLT+Dashboard",
        alt: "WDYLT Platform Preview",
      }}
    />
  );
}
