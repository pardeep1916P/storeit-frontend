"use client";

import React from "react";
import Image from "next/image";
import { cn, getFileIcon } from "@/lib/utils";

interface Props {
  type: string;
  extension: string;
  url?: string;
  imageClassName?: string;
  className?: string;
}

export const Thumbnail = ({
  type,
  extension,
  url = "",
  imageClassName,
  className,
}: Props) => {
  const isImage = type === "image" && extension !== "svg";
  const isVideo = type === "video";
  const isAudio = type === "audio";

  return (
    <figure className={cn("thumbnail relative", className)}>
      <Image
        src={isImage ? url : getFileIcon(extension, type)}
        alt="thumbnail"
        width={100}
        height={100}
        className={cn(
          "size-8 object-contain rounded transition-all duration-200",
          imageClassName,
          isImage && "thumbnail-image",
        )}
        onError={(e) => {
          // Fallback to file icon if image fails to load
          const target = e.target as HTMLImageElement;
          target.src = getFileIcon(extension, type);
          target.classList.remove('thumbnail-image');
        }}
        onLoad={(e) => {
          // Add loaded class for styling
          const target = e.target as HTMLImageElement;
          target.classList.add('loaded');
        }}
      />
      {/* Video play icon overlay */}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded">
          <Image
            src="/assets/icons/video.svg"
            alt="video"
            width={16}
            height={16}
            className="w-4 h-4"
          />
        </div>
      )}
      {/* Audio play icon overlay */}
      {isAudio && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded">
          <Image
            src="/assets/icons/file-audio.svg"
            alt="audio"
            width={16}
            height={16}
            className="w-4 h-4"
          />
        </div>
      )}
    </figure>
  );
};
export default Thumbnail;
