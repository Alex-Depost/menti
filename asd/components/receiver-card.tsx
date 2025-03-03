"use client";

import { AVATAR_URL } from "@/app/service/config";
import { MentorshipRequestDisplay } from "@/app/service/mentorship";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HtmlContent } from "@/components/ui/html-content";
import { formatRelativeTimeUTC } from "@/lib/utils";
import { CalendarDays, Mail } from "lucide-react";

interface ReceiverCardProps {
    request: MentorshipRequestDisplay;
    showActions?: boolean;
    contactInfo?: { email?: string; telegram_link?: string };
}

export function ReceiverCard({
    request,
    showActions = true,
    contactInfo
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

    // Format date for better readability using UTC time
    const formattedDate = formatRelativeTimeUTC(request.created_at);

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
                        
                        {/* Contact buttons for accepted requests */}
                        {request.status === 'accepted' && contactInfo && (
                            <div className="mt-4 flex flex-col sm:flex-row gap-2">
                                {contactInfo.email && (
                                    <button
                                        onClick={() => window.open(`mailto:${contactInfo.email}?subject=Менторство&body=Здравствуйте! Я принял(а) вашу заявку на менторство. Давайте обсудим детали сотрудничества.`, '_blank')}
                                        className="flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md border border-border/50 bg-background hover:bg-muted transition-colors"
                                    >
                                        <Mail className="h-4 w-4 mr-2" />
                                        Связаться по email
                                    </button>
                                )}
                                {contactInfo.telegram_link && (
                                    <button
                                        onClick={() => window.open(`${contactInfo.telegram_link}?text=Здравствуйте! Я принял(а) вашу заявку на менторство. Давайте обсудим детали сотрудничества.`, '_blank')}
                                        className="flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md border border-border/50 bg-background hover:bg-muted transition-colors"
                                    >
                                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm3.93 5.84l-1.68 8.275a.75.75 0 01-1.188.386l-2.079-1.629-1.192 1.19a.75.75 0 01-1.276-.544l.001-.033V12.4l4.844-4.305a.75.75 0 00-.915-1.177l-5.947 3.968-2.242-.899a.75.75 0 01-.094-1.32l11.75-6.05a.75.75 0 011.02 1.024z" />
                                        </svg>
                                        Связаться в Telegram
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}