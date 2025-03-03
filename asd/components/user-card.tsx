"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FeedItem } from "@/app/service/feed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, School } from "lucide-react";
import { AVATAR_URL } from "@/app/service/config";
import { UserRequestDialog } from "./user-request-dialog";
import { HtmlContent } from "@/components/ui/html-content";
import { Badge } from "@/components/ui/badge";

interface UserCardProps {
    item: FeedItem;
}

export function UserCard({ item }: UserCardProps) {
    const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

    // Get user initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Generate a consistent pastel color based on the user's name
    const generatePastelColor = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Generate pastel color (higher lightness, lower saturation)
        const h = hash % 360;
        return `hsl(${h}, 70%, 85%)`;
    };

    const avatarColor = generatePastelColor(item.name || '');

    return (
        <Card className="w-full overflow-hidden transition-all hover:shadow-md hover:border-primary/20 duration-300 flex flex-col group">
            <div className="p-5">
                {/* Header section with user info */}
                <div className="flex flex-col sm:flex-row gap-4 pb-4 border-b border-border/30">
                    <Avatar className="h-16 w-16 border border-border/50 ring-2 ring-background">
                        {(item.avatar_url || item.avatar_uuid) && (
                            <AvatarImage
                                src={item.avatar_url || `${AVATAR_URL}/${item.avatar_uuid}`}
                                alt={item.name || ''}
                            />
                        )}
                        <AvatarFallback
                            className="text-primary-foreground text-base font-medium"
                            style={{ backgroundColor: avatarColor }}
                        >
                            {getInitials(item.name || '')}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                                <h3 className="font-medium text-lg truncate max-w-full">{item.name}</h3>
                                <p className="text-sm text-muted-foreground truncate">{item.email}</p>
                            </div>
                            <Button
                                variant="default"
                                size="sm"
                                className="gap-2 text-sm whitespace-nowrap shrink-0"
                                onClick={() => setIsRequestDialogOpen(true)}
                            >
                                <MessageSquare className="h-4 w-4" />
                                Связаться
                            </Button>
                        </div>
                    </div>
                </div>

                {/* User content section */}
                <div className="mt-4 space-y-4">
                    {/* Title and description together */}
                    <div>
                        <h4 className="font-medium mb-2">{item.title}</h4>
                        {item.description ? (
                            <HtmlContent
                                html={item.description}
                                className="text-sm text-muted-foreground"
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground">Нет описания</p>
                        )}
                    </div>
                    {/* University tags */}
                    {((item.target_universities && item.target_universities.length > 0) || item.university) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {item.target_universities?.map((university, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="flex items-center gap-1.5 px-3 py-1 text-xs"
                                >
                                    <School className="h-3 w-3" />
                                    {university}
                                </Badge>
                            ))}
                            {!item.target_universities?.length && item.university && (
                                <Badge
                                    variant="secondary"
                                    className="flex items-center gap-1.5 px-3 py-1 text-xs"
                                >
                                    <School className="h-3 w-3" />
                                    {item.university}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* User Request Dialog */}
            <UserRequestDialog
                isOpen={isRequestDialogOpen}
                onClose={() => setIsRequestDialogOpen(false)}
                userId={item.id || 0}
                userName={item.name || ''}
            />
        </Card>
    );
}