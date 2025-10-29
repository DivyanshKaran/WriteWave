import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Mail, MapPin, Calendar } from "lucide-react";
import { AccessibleButton } from "@/components/accessibility";
import { withMemo } from "@/hooks/usePerformance";

interface ProfileHeaderProps {
  user: {
    name: string;
    username: string;
    email: string;
    location: string;
    joinedDate: string;
    bio: string;
  };
  onEditProfile: () => void;
}

export const ProfileHeader = withMemo<ProfileHeaderProps>(({ user, onEditProfile }: ProfileHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row items-start gap-6">
      <Avatar className="w-24 h-24">
        <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
          {user.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
            <p className="text-muted-foreground mb-2">{user.username}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {user.joinedDate}</span>
              </div>
            </div>
          </div>
          <AccessibleButton variant="outline" size="sm" onClick={onEditProfile}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </AccessibleButton>
        </div>
        
        <p className="text-muted-foreground mb-4">{user.bio}</p>
      </div>
    </div>
  );
});
