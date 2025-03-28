import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProfileAvatar from "@/components/ui/ProfileAvatar";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { MessageSquare, UserMinus, UserPlus, UserCheck, User, Calendar, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Friend } from "@/types/friend";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";

interface FriendCardProps {
  friend: Friend;
  isFriend?: boolean;
  isPending?: boolean;
  isRecommendation?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

const FriendCard = ({ 
  friend, 
  isFriend = false, 
  isPending = false, 
  isRecommendation = false,
  onAccept,
  onReject
}: FriendCardProps) => {
  const [status, setStatus] = useState({
    isFriend,
    isPending,
    isRecommendation
  });
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const navigate = useNavigate();

  const handleFriendAction = () => {
    if (status.isFriend) {
      setStatus({...status, isFriend: false});
      toast.success("Friend removed");
    } else if (status.isPending) {
      setStatus({...status, isPending: false});
      toast.success("Friend request cancelled");
    } else {
      setStatus({...status, isPending: true});
      toast.success("Friend request sent");
    }
  };

  const handleAccept = () => {
    if (onAccept) {
      onAccept(friend.id);
    } else {
      setStatus({isFriend: true, isPending: false, isRecommendation: false});
      toast.success(`You are now friends with ${friend.name}`);
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject(friend.id);
    } else {
      setStatus({...status, isPending: false});
      toast.success("Friend request rejected");
    }
  };

  const handleMessageClick = () => {
    setIsMessageDialogOpen(true);
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      toast.success(`Message sent to ${friend.name}`);
      setMessageText("");
      setIsMessageDialogOpen(false);
    } else {
      toast.error("Please enter a message");
    }
  };

  const handleViewBits = () => {
    navigate(`/friends/${friend.id}/bits`);
    toast.success(`Viewing ${friend.name}'s bits`);
  };

  const memberSince = formatDistanceToNow(new Date(friend.joined_date), { addSuffix: true });

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <ProfileAvatar 
            src={friend.avatar_url} 
            fallbackText={friend.name}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg truncate">{friend.name}</h3>
                <p className="text-muted-foreground text-sm truncate">{friend.email}</p>
              </div>
              {friend.mutual_friends > 0 && (
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost" className="h-8 px-2">
                      <User className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">{friend.mutual_friends}</span>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-auto p-2">
                    <p className="text-sm">{friend.mutual_friends} mutual friends</p>
                  </HoverCardContent>
                </HoverCard>
              )}
            </div>
            <div className="flex items-center mt-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Joined {memberSince}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-6 py-4 bg-muted/30 flex justify-between">
        {!isPending && friend.is_inbound_request ? (
          <div className="flex gap-2 w-full">
            <Button onClick={handleAccept} className="flex-1">Accept</Button>
            <Button variant="outline" onClick={handleReject} className="flex-1">Decline</Button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleMessageClick}>
                <MessageSquare className="h-4 w-4 mr-1" />
                Message
              </Button>
              <Button variant="ghost" size="sm" onClick={handleViewBits}>
                <BookOpen className="h-4 w-4 mr-1" />
                View Bits
              </Button>
            </div>
            <Button 
              variant={status.isFriend ? "outline" : "default"} 
              size="sm"
              onClick={handleFriendAction}
            >
              {status.isFriend ? (
                <>
                  <UserMinus className="h-4 w-4 mr-1" />
                  Unfriend
                </>
              ) : status.isPending ? (
                <>
                  <UserCheck className="h-4 w-4 mr-1" />
                  Pending
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add Friend
                </>
              )}
            </Button>
          </>
        )}
      </CardFooter>

      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send message to {friend.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Textarea 
              placeholder="Type your message here..." 
              className="min-h-[100px]"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendMessage}>Send Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default FriendCard;
