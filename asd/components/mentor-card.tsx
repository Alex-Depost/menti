"use client";

import { Card } from "@/components/ui/card";
import { FeedItem } from "@/app/service/feed";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface MentorCardProps {
    item: FeedItem;
}

export function MentorCard({ item }: MentorCardProps) {
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
        <Card className="w-full overflow-hidden transition-all hover:shadow-md hover:border-primary/20 duration-300 flex flex-col group">
            <div className="p-5">
                {/* Header section with mentor info */}
                <div className="flex items-center gap-4 pb-4 border-b border-border/30">
                    <Avatar className="h-16 w-16 border border-border/50 ring-2 ring-background">
                        <AvatarFallback
                            className="text-primary-foreground text-base font-medium"
                            style={{ backgroundColor: avatarColor }}
                        >
                            {getInitials(item.mentor.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h3 className="font-medium text-lg">{item.mentor.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.mentor.email}</p>
                    </div>
                    <Button
                        variant="default"
                        size="sm"
                        className="gap-2 text-sm whitespace-nowrap"
                    >
                        <MessageSquare className="h-4 w-4" />
                        Связаться
                    </Button>
                </div>

                {/* Resume content section */}
                <div className="mt-4 space-y-4">
                    {/* Title and description together */}
                    <div>
                        <h4 className="font-medium mb-2">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                </div>
            </div>
        </Card>
    );
}
