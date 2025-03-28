
import { useState } from "react";
import { sampleFriendRequests } from "@/data/sampleFriends";
import FriendCard from "./FriendCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const FriendRequests = () => {
  const [requests, setRequests] = useState(sampleFriendRequests);
  
  const incomingRequests = requests.filter(request => request.is_inbound_request);
  const outgoingRequests = requests.filter(request => !request.is_inbound_request);
  
  const handleAcceptRequest = (id: string) => {
    setRequests(requests.filter(request => request.id !== id));
    // In a real app, we would make an API call to accept the friend request
  };
  
  const handleRejectRequest = (id: string) => {
    setRequests(requests.filter(request => request.id !== id));
    // In a real app, we would make an API call to reject the friend request
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="incoming" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="incoming">
            Incoming 
            {incomingRequests.length > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {incomingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="outgoing">
            Outgoing
            {outgoingRequests.length > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs text-secondary-foreground">
                {outgoingRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="incoming" className="space-y-4">
          {incomingRequests.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No incoming requests</h3>
              <p className="text-muted-foreground">
                When someone adds you as a friend, you'll see their request here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {incomingRequests.map((request) => (
                <FriendCard 
                  key={request.id} 
                  friend={request} 
                  isPending={true}
                  onAccept={handleAcceptRequest}
                  onReject={handleRejectRequest}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="outgoing" className="space-y-4">
          {outgoingRequests.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No outgoing requests</h3>
              <p className="text-muted-foreground">
                Friend requests you've sent will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {outgoingRequests.map((request) => (
                <FriendCard 
                  key={request.id} 
                  friend={request} 
                  isPending={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FriendRequests;
