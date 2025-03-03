"use client";

import { AVATAR_URL } from "@/app/service/config";
import { FeedItem } from "@/app/service/feed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HtmlContent } from "@/components/ui/html-content";
import { Briefcase, GraduationCap, MessageSquare } from "lucide-react";
import { useState } from "react";
import { MentorshipRequestDialog } from "./mentorship-request-dialog";

interface MentorCardProps {
    item: FeedItem;
}

export function MentorCard({ item }: MentorCardProps) {
    const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

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

    const avatarColor = generatePastelColor(item.name || '');

    return (
        <Card className="w-full overflow-hidden transition-all hover:shadow-lg group border-border/30 hover:border-primary/30 duration-300">
            {/* Top colored bar - uses the same color as the avatar for consistency */}
            <div className="h-2" style={{ backgroundColor: avatarColor }}></div>
            
            <div className="p-6">
                {/* Header section with mentor info */}
                <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-background shadow-md ring-2 ring-background">
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
                    
                    <div className="flex-1">
                        <h3 className="font-semibold text-xl">{item.name}</h3>
                        
                        <div className="flex flex-col gap-1 mt-1">
                            {item.title && (
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground/70" />
                                    <span>{item.title}</span>
                                </div>
                            )}
                            
                            {item.university && (
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <GraduationCap className="h-3.5 w-3.5 text-muted-foreground/70" />
                                    <span>{item.university}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <Button
                        variant="default"
                        size="sm"
                        className="gap-2 text-sm whitespace-nowrap shadow-sm"
                        onClick={() => setIsRequestDialogOpen(true)}
                    >
                        <MessageSquare className="h-4 w-4" />
                        Связаться
                    </Button>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-border/40 my-4"></div>

                {/* Description section */}
                <div className="mt-2">
                    {item.description ? (
                        <HtmlContent
                            html={item.description}
                            className="text-sm text-muted-foreground prose-sm max-w-none prose-p:leading-relaxed prose-p:my-1"
                        />
                    ) : (
                        <p className="text-sm text-muted-foreground italic">Нет описания</p>
                    )}
                </div>
            </div>
            
            {/* Mentorship Request Dialog */}
            <MentorshipRequestDialog
                isOpen={isRequestDialogOpen}
                onClose={() => setIsRequestDialogOpen(false)}
                mentorId={item.id || 0}
                mentorName={item.name || ''}
            />
        </Card>
    );
}
