"use client";

import React from "react";
import { ProfileCard } from "@/components/profile-card";

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Профиль</h1>
      <ProfileCard />
    </div>
  );
}