import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedItem } from "@/app/service/feed";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

    return (
        <Card className="w-full h-full overflow-hidden transition-all hover:shadow-md flex flex-col">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-10 w-10 border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(item.mentor.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
                        <CardDescription className="text-xs">{item.mentor.name} • {item.mentor.email}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
                <p className="text-sm text-muted-foreground mb-auto pb-4 line-clamp-3">{item.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {item.tags.map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer hover:bg-secondary/80 text-xs py-0.5"
                            onClick={() => onTagClick(tag)}
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
