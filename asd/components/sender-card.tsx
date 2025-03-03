"use client";

import { AVATAR_URL } from "@/app/service/config";
import { MentorshipRequestDisplay } from "@/app/service/mentorship";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarDays, Mail } from "lucide-react";

interface SenderCardProps {
    request: MentorshipRequestDisplay;
    showActions?: boolean;
    onAccept?: (id: number) => void;
    onReject?: (id: number) => void;
    isProcessing?: boolean;
}

export function SenderCard({
    request,
    showActions = true,
    onAccept,
    onReject,
    isProcessing = false
}: SenderCardProps) {
    // Get sender initials for avatar
    const getInitials = (name: string) => {
        if (!name) return "??";
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Generate a consistent pastel color based on the sender's name
    const generatePastelColor = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Generate pastel color (higher lightness, lower saturation)
        const h = hash % 360;
        return `hsl(${h}, 70%, 85%)`;
    };

    const avatarColor = generatePastelColor(request.sender_name || '');
    const senderInfo = request.sender || {
        id: 0,
        login: '',
        name: '',
        description: '',
        email: '',
        avatar_url: '',
        target_universities: [] as string[]
    };

    // Format date for better readability
    const formattedDate = formatDistanceToNow(new Date(request.created_at), {
        addSuffix: true,
        locale: ru
    });

    // Get status badge
    const getStatusBadge = () => {
        switch(request.status) {
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
                {/* Header section with sender info */}
                <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border border-border/50 ring-2 ring-background shadow-sm">
                        {request.sender_avatar && (
                            <AvatarImage
                                src={`${AVATAR_URL}/${request.sender_avatar}`}
                                alt={request.sender_name || ''}
                            />
                        )}
                        <AvatarFallback
                            className="text-primary-foreground text-base font-medium"
                            style={{ backgroundColor: avatarColor }}
                        >
                            {getInitials(request.sender_name || '')}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-lg">{request.sender_name}</h3>
                                    {getStatusBadge()}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                                    {request.sender_email}
                                </div>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                                {formattedDate}
                            </div>
                        </div>

                        {/* Sender description */}
                        {senderInfo.description && (
                            <div className="mt-3">
                                <p className="text-sm text-muted-foreground">
                                    {senderInfo.description}
                                </p>
                            </div>
                        )}

                        {/* Target universities for users */}
                        {senderInfo.target_universities && senderInfo.target_universities.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {senderInfo.target_universities.map((uni, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                        {uni}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Request message */}
                        <div className="mt-4 p-4 bg-muted/50 rounded-md border border-border/30">
                            <p className="text-sm whitespace-pre-wrap">{request.message}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}