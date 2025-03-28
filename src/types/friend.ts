
export interface Friend {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  joined_date: string;
  mutual_friends: number;
  is_inbound_request: boolean;
}
