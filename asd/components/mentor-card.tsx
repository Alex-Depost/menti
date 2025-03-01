import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedItem } from "@/app/service/feed";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface MentorCardProps {
    item: FeedItem;
    onTagClick: (tag: string) => void;
}

export function MentorCard({ item, onTagClick }: MentorCardProps) {
    // Get mentor initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Generate a consistent pastel color based on the mentor's name
    const generatePastelColor = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        // Generate pastel color (higher lightness, lower saturation)
        const h = hash % 360;
        return `hsl(${h}, 70%, 85%)`;
    };

    const avatarColor = generatePastelColor(item.mentor.name);

    return (
        <Card className="w-full h-full overflow-hidden transition-all hover:shadow-md hover:translate-y-[-2px] duration-300 flex flex-col group">
            <CardHeader className="pb-2 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex items-center gap-3 mb-2 relative">
                    <Avatar className="h-12 w-12 border border-border shadow-sm">
                        <AvatarFallback 
                            className="text-primary-foreground text-sm font-medium"
                            style={{ backgroundColor: avatarColor }}
                        >
                            {getInitials(item.mentor.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1">
                            {item.mentor.name} • {item.mentor.email}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
                <p className="text-sm text-muted-foreground mb-auto pb-4 line-clamp-3">{item.description}</p>
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                            <Badge
                                key={tag}
                                variant="secondary"
                                className="cursor-pointer hover:bg-secondary/80 text-xs py-0.5 transition-colors"
                                onClick={() => onTagClick(tag)}
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2 gap-2 text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Связаться с ментором
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
