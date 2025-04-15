"use client";

import * as React from "react";
import type { FC } from "react";
import Image from "next/image";

interface DevotionHeaderProps {
  reference: string;
  imageUrl?: string;
}

const DevotionHeader: FC<DevotionHeaderProps> = ({
  reference,
  imageUrl = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
}) => {
  return (
    <div className="relative w-full h-48">
      <Image
        src={imageUrl}
        alt="Devotional background"
        fill
        className="object-cover brightness-75"
        priority
      />
      <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/60 to-transparent">
        <div className="text-white">
          <h2 className="text-2xl font-bold mb-2">Today's Scripture</h2>
          <p className="text-lg opacity-90">{reference}</p>
        </div>
      </div>
    </div>
  );
};

export default DevotionHeader;
