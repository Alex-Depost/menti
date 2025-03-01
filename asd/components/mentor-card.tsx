import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedItem } from "@/app/service/feed";

interface MentorCardProps {
    item: FeedItem;
    onTagClick: (tag: string) => void;
}

export function MentorCard({ item, onTagClick }: MentorCardProps) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.mentor.name} • {item.mentor.email}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer hover:bg-secondary/80"
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
