"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export function LoadingProfile() {
    return (
        <div className="container mx-auto py-8 px-4 md:px-8">
            <Skeleton className="h-8 w-64 mb-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Левая колонка - информация о профиле */}
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32 mb-2" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col items-center">
                                <Skeleton className="h-32 w-32 rounded-full mb-4" />
                                <Skeleton className="h-5 w-40 mb-2" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-5 w-full" />
                            </div>
                            
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-5 w-full" />
                            </div>
                            
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
                
                {/* Правая колонка - форма редактирования */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-32 w-full" />
                            </div>
                            
                            <div className="flex justify-between">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-40" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}