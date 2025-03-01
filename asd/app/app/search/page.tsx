"use client";

import React from "react";

export default function SearchPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Поиск менти</h1>
      <div className="bg-muted/30 p-8 rounded-lg text-center">
        <p className="text-lg text-muted-foreground mb-4">
          Страница поиска менти находится в разработке
        </p>
        <div className="animate-pulse flex justify-center">
          <div className="h-4 w-24 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  );
}