"use client";

import { AVATAR_URL } from "@/app/service/config";
import { MentorshipRequestDisplay } from "@/app/service/mentorship";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HtmlContent } from "@/components/ui/html-content";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarDays } from "lucide-react";

interface ReceiverCardProps {
    request: MentorshipRequestDisplay;
    showActions?: boolean;
}

export function ReceiverCard({
    request,
    showActions = true
}: ReceiverCardProps) {
    // Get receiver initials for avatar
    const getInitials = (name: string) => {
        if (!name) return "??";
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Generate a consistent pastel color based on the receiver's name
    const generatePastelColor = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Generate pastel color (higher lightness, lower saturation)
        const h = hash % 360;
        return `hsl(${h}, 70%, 85%)`;
    };

    const receiverName = request.receiver?.name || request.receiver_name || '';
    const avatarColor = generatePastelColor(receiverName);

    // Format date for better readability
    const formattedDate = formatDistanceToNow(new Date(request.created_at), {
        addSuffix: true,
        locale: ru
    });

    // Get status badge
    const getStatusBadge = () => {
        switch (request.status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Ожидает ответа</Badge>;
            case 'accepted':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Принята</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Отклонена</Badge>;
            default:
                return null;
        }
    };

    return (
        <Card className="w-full overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
                {/* Header section with receiver info */}
                <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border border-border/50 ring-2 ring-background shadow-sm">
                        {(request.receiver?.avatar_url || request.receiver_avatar) && (
                            <AvatarImage
                                src={`${AVATAR_URL}/${request.receiver?.avatar_url || request.receiver_avatar}`}
                                alt={receiverName}
                            />
                        )}
                        <AvatarFallback
                            className="text-primary-foreground text-base font-medium"
                            style={{ backgroundColor: avatarColor }}
                        >
                            {getInitials(receiverName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-lg">{receiverName}</h3>
                                    {getStatusBadge()}
                                </div>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                                {formattedDate}
                            </div>
                        </div>

                        {/* Receiver description with formatted content */}
                        {(request.receiver?.description || request.receiver_description) && (
                            <div className="mt-3">
                                <HtmlContent
                                    html={request.receiver?.description || request.receiver_description || ''}
                                    className="text-sm text-muted-foreground"
                                />
                            </div>
                        )}

                        {/* Receiver universities */}
                        {request.receiver?.target_universities && request.receiver.target_universities.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                {request.receiver.target_universities.map((university, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                        {university}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Request message with formatted content */}
                        <div className="mt-4 p-4 bg-muted/50 rounded-md border border-border/30">
                            <HtmlContent
                                html={request.message}
                                className="text-sm"
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}