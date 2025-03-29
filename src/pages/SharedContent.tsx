
import React from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SocialShare from "@/components/share/SocialShare";
import OpenGraphHead from "@/components/share/OpenGraphHead";
import PageTransition from "@/components/ui/PageTransition";

const SharedContent = () => {
  const { id } = useParams<{ id: string }>();
  const title = `Shared Content - ${id || "Example"}`;
  const description = "Check out this amazing content I found on Cozy Team Hub!";
  
  // Mock content for demo
  const content = {
    title: "How to Build Effective Team Communication",
    body: `
      <p class="mb-4">Effective team communication is crucial for any project's success. Here are some strategies to improve it:</p>
      
      <h3 class="text-xl font-semibold mb-2">1. Establish Clear Communication Channels</h3>
      <p class="mb-4">Define which channels should be used for different types of communication. For example, use Slack for quick questions, email for formal documentation, and meetings for complex discussions.</p>
      
      <h3 class="text-xl font-semibold mb-2">2. Set Communication Expectations</h3>
      <p class="mb-4">Make sure everyone knows how quickly they should respond to messages and which matters require immediate attention.</p>
      
      <h3 class="text-xl font-semibold mb-2">3. Practice Active Listening</h3>
      <p class="mb-4">Encourage team members to truly listen to each other rather than just waiting for their turn to speak.</p>
      
      <h3 class="text-xl font-semibold mb-2">4. Use Visual Communication</h3>
      <p class="mb-4">Utilize diagrams, charts, and other visual aids to make complex information more digestible.</p>
      
      <h3 class="text-xl font-semibold mb-2">5. Schedule Regular Check-ins</h3>
      <p>Consistent team meetings help ensure everyone stays aligned and issues are addressed promptly.</p>
    `,
    date: "May 15, 2023",
    author: "Communication Expert",
    tags: ["communication", "teamwork", "productivity"],
    image_url: "/og-image.png"
  };

  return (
    <PageTransition>
      <OpenGraphHead 
        title={title}
        description={description}
        imageUrl={content.image_url}
        type="article"
      />
      
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" className="mb-6" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <article className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
            <SocialShare 
              title={content.title} 
              hashtags={content.tags}
            />
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground mb-6">
            <span>{content.date}</span>
            <span className="mx-2">•</span>
            <span>{content.author}</span>
          </div>
          
          <div 
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content.body }}
          />
          
          <div className="flex flex-wrap gap-2 mt-6">
            {content.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                #{tag}
              </span>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-medium mb-4">Share this content</h3>
            <SocialShare 
              title={content.title} 
              description={description}
              hashtags={content.tags}
              className="justify-start"
            />
          </div>
        </article>
      </div>
    </PageTransition>
  );
};

export default SharedContent;
