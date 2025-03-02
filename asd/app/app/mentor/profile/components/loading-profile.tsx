"use client";

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from "@/components/ui/card";

export function LoadingProfile() {
    return (
        <div className="container mx-auto py-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-center">Загрузка профиля...</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                        <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                        <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}