import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import PageTransition from "../components/ui/PageTransition";
import { HeroSectionDemo } from "@/components/blocks/hero-section-demo";

const Index = () => {
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold">W</span>
              </div>
              <span className="font-semibold">WDYLT</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <button className="text-sm font-medium hover:text-foreground/80">Sign in</button>
              </Link>
              <Link to="/auth">
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90">Create account</button>
              </Link>
            </div>
          </div>
        </header>
        
        {/* Hero section using our new component */}
        <HeroSectionDemo />

        {/* Features section */}
        <section id="features" className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Share Your Knowledge Journey</h2>
              <p className="text-muted-foreground mt-2">Everything you need to capture and share what you learn</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg border shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Bookmark Content</h3>
                <p className="text-muted-foreground">Save articles, videos, and resources you discover during your learning journey.</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Community Learning</h3>
                <p className="text-muted-foreground">Connect with others who share your interests and learn collaboratively.</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Video size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Video Transformation</h3>
                <p className="text-muted-foreground">Turn your saved content into engaging short-form videos to share your knowledge.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works section */}
        <section className="bg-muted/30 py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">How It Works</h2>
              <p className="text-muted-foreground mt-2">Simple steps to start sharing your learning journey</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-card p-6 rounded-lg border relative">
                <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center">1</div>
                <h3 className="text-lg font-semibold mb-2 mt-4">Discover</h3>
                <p className="text-muted-foreground text-sm">Find interesting content across the web during your learning sessions</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border relative">
                <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center">2</div>
                <h3 className="text-lg font-semibold mb-2 mt-4">Save</h3>
                <p className="text-muted-foreground text-sm">Bookmark content with our extension or mobile app in one click</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border relative">
                <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center">3</div>
                <h3 className="text-lg font-semibold mb-2 mt-4">Transform</h3>
                <p className="text-muted-foreground text-sm">Convert your insights into short, engaging video content</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border relative">
                <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center">4</div>
                <h3 className="text-lg font-semibold mb-2 mt-4">Share</h3>
                <p className="text-muted-foreground text-sm">Share your knowledge with the community and on social platforms</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials/Benefits */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Why Use WDYLT?</h2>
              <p className="text-muted-foreground mt-2">Benefits of sharing your learning journey</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-lg border flex gap-4 items-start">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Check size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Retain Knowledge Better</h3>
                  <p className="text-muted-foreground">Teaching what you've learned helps you remember 90% more of what you study</p>
                </div>
              </div>
              
              <div className="p-6 rounded-lg border flex gap-4 items-start">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Check size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Build Your Network</h3>
                  <p className="text-muted-foreground">Connect with like-minded learners and experts in your field of interest</p>
                </div>
              </div>
              
              <div className="p-6 rounded-lg border flex gap-4 items-start">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Check size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Organized Learning</h3>
                  <p className="text-muted-foreground">Keep all your learning resources categorized and easily accessible</p>
                </div>
              </div>
              
              <div className="p-6 rounded-lg border flex gap-4 items-start">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Check size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Grow Your Audience</h3>
                  <p className="text-muted-foreground">Build your personal brand by sharing valuable insights with short videos</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Link to="/auth">
                <Button size="lg" className="animate-pulse">
                  Join WDYLT Today
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to share what you learn?</h2>
            <p className="max-w-2xl mx-auto mb-8 opacity-90">
              Join thousands of learners who are documenting and sharing their knowledge journey with WDYLT
            </p>
            <Link to="/auth">
              <Button variant="secondary" size="lg">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8">
          <div className="container flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold">W</span>
              </div>
              <span className="font-semibold">What Did You Learn Today?</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">About</a>
              <a href="#" className="hover:text-foreground transition-colors">Blog</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </div>
            <p className="text-sm text-muted-foreground mt-4 md:mt-0">
              © {new Date().getFullYear()} WDYLT. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Index;
