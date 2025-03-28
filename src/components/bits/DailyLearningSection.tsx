
import React from "react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Book, Lightbulb, Calendar, Link, ExternalLink } from "lucide-react";
import ProfileAvatar from "@/components/ui/ProfileAvatar";
import { useNavigate } from "react-router-dom";

interface DailyLearningProps {
  learnings: {
    id: string;
    date: string;
    content: string;
    tags: string[];
    relatedBitId?: string;
    externalUrl?: string;
    title?: string;
  }[];
  friendName: string;
  friendAvatar?: string;
  bits?: any[];
  onBitClick?: (bitId: string) => void;
}

const DailyLearningSection: React.FC<DailyLearningProps> = ({ 
  learnings, 
  friendName,
  friendAvatar,
  bits,
  onBitClick
}) => {
  const navigate = useNavigate();
  
  // Group learnings by date
  const groupedByDate = learnings.reduce((acc, learning) => {
    const dateKey = format(new Date(learning.date), 'MMM d, yyyy');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(learning);
    return acc;
  }, {} as Record<string, typeof learnings>);

  // Sort dates in reverse chronological order
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  const handleLearningClick = (learning: typeof learnings[0]) => {
    if (learning.relatedBitId) {
      // Call the onBitClick handler if provided
      if (onBitClick) {
        onBitClick(learning.relatedBitId);
      } else {
        console.log("Navigate to bit:", learning.relatedBitId);
      }
    } else if (learning.externalUrl) {
      // Open external URL in a new tab
      window.open(learning.externalUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (learnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center gap-2">
        <Book className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">What {friendName} Learned</h2>
      </div>
      
      {sortedDates.map(date => (
        <div key={date} className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">{date}</h3>
          </div>
          
          <div className="pl-6 space-y-3">
            {groupedByDate[date].map(learning => (
              <Card 
                key={learning.id} 
                className={`overflow-hidden border-l-4 border-l-primary bg-card/50 
                  ${(learning.relatedBitId || learning.externalUrl) ? 
                    'hover:bg-card/80 transition-colors cursor-pointer' : ''}`}
                onClick={() => (learning.relatedBitId || learning.externalUrl) && handleLearningClick(learning)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="mt-1">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      {learning.title && (
                        <h4 className="font-medium mb-1 flex items-center gap-1">
                          {learning.title}
                          {learning.externalUrl && (
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          {learning.relatedBitId && !learning.externalUrl && (
                            <Link className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </h4>
                      )}
                      <p className="text-muted-foreground">{learning.content}</p>
                      
                      {learning.tags && learning.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {learning.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center gap-1.5">
                          <ProfileAvatar 
                            src={friendAvatar} 
                            fallbackText={friendName}
                            size="sm"
                          />
                          <span className="text-xs text-muted-foreground">{friendName}</span>
                        </div>
                        
                        {learning.relatedBitId && (
                          <Badge variant="secondary" className="text-xs cursor-pointer">
                            Related Bit
                          </Badge>
                        )}
                        
                        {learning.externalUrl && (
                          <Badge variant="secondary" className="text-xs cursor-pointer">
                            External Link
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DailyLearningSection;
