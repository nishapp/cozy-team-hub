
import { Friend } from "@/types/friend";

// Sample friends for demo
export const sampleFriends: Friend[] = [
  {
    id: "friend-1",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    avatar_url: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=0D8ABC&color=fff",
    joined_date: "2023-01-15T12:00:00Z",
    mutual_friends: 5,
    is_inbound_request: false
  },
  {
    id: "friend-2",
    name: "Michael Chen",
    email: "michael.c@example.com",
    avatar_url: "https://ui-avatars.com/api/?name=Michael+Chen&background=6B21A8&color=fff",
    joined_date: "2023-03-22T10:30:00Z",
    mutual_friends: 3,
    is_inbound_request: false
  },
  {
    id: "friend-3",
    name: "Alex Martinez",
    email: "alex.m@example.com",
    avatar_url: "https://ui-avatars.com/api/?name=Alex+Martinez&background=1D4ED8&color=fff",
    joined_date: "2022-11-05T15:45:00Z",
    mutual_friends: 7,
    is_inbound_request: false
  },
  {
    id: "friend-4",
    name: "Emily Wilson",
    email: "emily.w@example.com",
    avatar_url: "https://ui-avatars.com/api/?name=Emily+Wilson&background=B91C1C&color=fff",
    joined_date: "2023-05-10T09:15:00Z",
    mutual_friends: 2,
    is_inbound_request: false
  }
];

// Sample friend requests for demo
export const sampleFriendRequests: Friend[] = [
  {
    id: "request-1",
    name: "Taylor Swift",
    email: "taylor.s@example.com",
    avatar_url: "https://ui-avatars.com/api/?name=Taylor+Swift&background=047857&color=fff",
    joined_date: "2023-04-18T14:20:00Z",
    mutual_friends: 1,
    is_inbound_request: true
  },
  {
    id: "request-2",
    name: "Jordan Peterson",
    email: "jordan.p@example.com",
    avatar_url: "https://ui-avatars.com/api/?name=Jordan+Peterson&background=7C3AED&color=fff",
    joined_date: "2023-02-27T11:40:00Z",
    mutual_friends: 4,
    is_inbound_request: true
  },
  {
    id: "request-3",
    name: "Rebecca Lee",
    email: "rebecca.l@example.com",
    avatar_url: "https://ui-avatars.com/api/?name=Rebecca+Lee&background=F59E0B&color=fff",
    joined_date: "2023-06-05T13:10:00Z",
    mutual_friends: 0,
    is_inbound_request: false
  }
];

// Sample recommendations for demo
export const sampleRecommendations: Friend[] = [
  {
    id: "rec-1",
    name: "David Kim",
    email: "david.k@example.com",
    avatar_url: "https://ui-avatars.com/api/?name=David+Kim&background=4338CA&color=fff",
    joined_date: "2023-01-30T16:25:00Z",
    mutual_friends: 8,
    is_inbound_request: false
  },
  {
    id: "rec-2",
    name: "Sophia Patel",
    email: "sophia.p@example.com",
    avatar_url: "https://ui-avatars.com/api/?name=Sophia+Patel&background=0E7490&color=fff",
    joined_date: "2023-04-12T10:05:00Z",
    mutual_friends: 5,
    is_inbound_request: false
  },
  {
    id: "rec-3",
    name: "James Thompson",
    email: "james.t@example.com",
    avatar_url: "https://ui-avatars.com/api/?name=James+Thompson&background=B45309&color=fff",
    joined_date: "2022-12-08T09:50:00Z",
    mutual_friends: 3,
    is_inbound_request: false
  },
  {
    id: "rec-4",
    name: "Olivia Garcia",
    email: "olivia.g@example.com",
    avatar_url: "https://ui-avatars.com/api/?name=Olivia+Garcia&background=9D174D&color=fff",
    joined_date: "2023-03-15T11:35:00Z",
    mutual_friends: 6,
    is_inbound_request: false
  },
  {
    id: "rec-5",
    name: "Ethan Johnson",
    email: "ethan.j@example.com",
    avatar_url: "https://ui-avatars.com/api/?name=Ethan+Johnson&background=6D28D9&color=fff",
    joined_date: "2023-02-20T15:15:00Z",
    mutual_friends: 4,
    is_inbound_request: false
  },
  {
    id: "rec-6",
    name: "Ava Williams",
    email: "ava.w@example.com",
    avatar_url: "https://ui-avatars.com/api/?name=Ava+Williams&background=059669&color=fff",
    joined_date: "2023-05-25T14:40:00Z",
    mutual_friends: 2,
    is_inbound_request: false
  }
];
