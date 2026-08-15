import StarField from "@/components/StarField";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import QuickStart from "@/components/QuickStart";
import HowItWorks from "@/components/HowItWorks";
import WorkspaceDemo from "@/components/WorkspaceDemo";
import TeamFeatures from "@/components/TeamFeatures";
import SkillsSection from "@/components/SkillsSection";
import Testimonials from "@/components/Testimonials";
import FaqSection from "@/components/FaqSection";
import DocsSection from "@/components/DocsSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      {/* Animated star background */}
      <StarField />

      {/* Deep red ambient background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(100,10,10,0.18) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      {/* Navigation */}
      <Navbar />

      {/* Page content — sits above stars */}
      <div className="relative z-10">
        <HeroSection />
        <QuickStart />
        <HowItWorks />
        <WorkspaceDemo />
        <TeamFeatures />
        <SkillsSection />
        <Testimonials />
        <FaqSection />
        <DocsSection />
        <FinalCTA />
        <Footer />
      </div>
    </main>
  );
}