"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, X, Play, Pause, Volume2, Plus, Minus, Music } from "lucide-react";
import { convertFileSize, formatDateTime } from "@/lib/utils";
import { Models } from "node-appwrite";

interface InlinePreviewProps {
  file: Models.Document;
  isOpen: boolean;
  onClose: () => void;
}

export const InlinePreview = ({ file, isOpen, onClose }: InlinePreviewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    
    try {
      // Use the same download URL as ActionDropdown for consistency
      const downloadUrl = file.bucketFileId ? 
        `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET}/files/${file.bucketFileId}/download?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}` :
        file.url;
      
      // Check if the file URL is accessible
      const response = await fetch(downloadUrl, {
        method: 'HEAD',
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Fetch the actual file content
      const fileResponse = await fetch(downloadUrl, {
        mode: 'cors'
      });
      
      if (!fileResponse.ok) {
        throw new Error(`Failed to download file: ${fileResponse.statusText}`);
      }
      
      // Get the correct MIME type for the file
      const getMimeType = (extension: string) => {
        const mimeTypes: { [key: string]: string } = {
          // Images
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'webp': 'image/webp',
          'svg': 'image/svg+xml',
          // Documents
          'pdf': 'application/pdf',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'txt': 'text/plain',
          'xls': 'application/vnd.ms-excel',
          'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'ppt': 'application/vnd.ms-powerpoint',
          'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          // Videos
          'mp4': 'video/mp4',
          'avi': 'video/x-msvideo',
          'mov': 'video/quicktime',
          'mkv': 'video/x-matroska',
          'webm': 'video/webm',
          // Audio
          'mp3': 'audio/mpeg',
          'wav': 'audio/wav',
          'ogg': 'audio/ogg',
          'flac': 'audio/flac',
        };
        return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
      };
      
      const blob = await fileResponse.blob();
      const mimeType = getMimeType(file.extension);
      const finalBlob = new Blob([blob], { type: mimeType });
      
      // Create download link
      const url = window.URL.createObjectURL(finalBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
    } catch (error) {
      console.error('Download failed:', error);
      
      // Fallback: try to open in new tab if download fails
      try {
        const fallbackUrl = file.bucketFileId ? 
          `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET}/files/${file.bucketFileId}/download?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}` :
          file.url;
        window.open(fallbackUrl, '_blank');
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(file.url, '_blank');
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
    const target = e.target as HTMLVideoElement | HTMLAudioElement;
    setCurrentTime(target.currentTime);
    setDuration(target.duration);
  };

  const handlePlayPause = (e: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
    const target = e.target as HTMLVideoElement | HTMLAudioElement;
    if (target.paused) {
      target.play();
      setIsPlaying(true);
    } else {
      target.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (file.type === 'image') {
      e.preventDefault();
      if (e.deltaY < 0) {
        setZoomLevel(prev => Math.min(prev + 0.25, 3));
      } else {
        setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
      }
    }
  };

  const renderPreview = () => {
    switch (file.type) {
                   case 'image':
        return (
          <div 
            className="relative overflow-hidden rounded-lg shadow-lg"
            onWheel={handleWheel}
          >
            <img
              src={file.url}
              alt={file.name}
              className="w-full h-auto max-h-[50vh] sm:max-h-[70vh] object-contain transition-transform duration-200 ease-in-out cursor-pointer hover:opacity-90"
              style={{ transform: `scale(${zoomLevel})` }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Image is already in preview, so clicking it could open in new tab for full-size view
                window.open(file.url, '_blank');
              }}
              onError={(e) => {
                e.currentTarget.src = '/assets/icons/file-image.svg';
              }}
            />
          </div>
        );

      case 'video':
        return (
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-8 max-w-2xl mx-auto">
            {/* Mobile: Labels above, buttons below */}
            <div className="block sm:hidden">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{file.name}</h3>
                <p className="text-sm text-gray-600">{convertFileSize(file.size)}</p>
              </div>
              
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <Play className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <div className="space-y-4">
                <video
                  controls
                  className="w-full rounded-lg shadow-lg"
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onLoadedMetadata={handleTimeUpdate}
                  onError={(e) => {
                    console.error('Video loading error:', e);
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.style.display = 'flex';
                  }}
                >
                  <source src={file.url} type={`video/${file.extension}`} />
                  Your browser does not support the video tag.
                </video>
                <div className="hidden absolute inset-0 bg-gray-50 rounded-lg items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Play className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-500">Video preview not available</p>
                  </div>
                </div>
                
                <div className="flex justify-center gap-3 pt-4">
                  <Button
                    onClick={handleOpenInNewTab}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open
                  </Button>
                  <Button
                    onClick={handleDownload}
                    disabled={isLoading}
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isLoading ? 'Downloading...' : 'Download'}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Desktop/Tablet: Original layout */}
            <div className="hidden sm:block">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <Play className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{file.name}</h3>
                <p className="text-sm text-gray-600">{convertFileSize(file.size)}</p>
              </div>
              
              <div className="space-y-4">
                <video
                  controls
                  className="w-full rounded-lg shadow-lg"
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onLoadedMetadata={handleTimeUpdate}
                  onError={(e) => {
                    console.error('Video loading error:', e);
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.style.display = 'flex';
                  }}
                >
                  <source src={file.url} type={`video/${file.extension}`} />
                  Your browser does not support the video tag.
                </video>
                <div className="hidden absolute inset-0 bg-gray-50 rounded-lg items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Play className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-500">Video preview not available</p>
                  </div>
                </div>
                
                <div className="flex justify-center gap-3 pt-4">
                  <Button
                    onClick={handleOpenInNewTab}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open
                  </Button>
                  <Button
                    onClick={handleDownload}
                    disabled={isLoading}
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isLoading ? 'Downloading...' : 'Download'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 max-w-md mx-auto">
            {/* Mobile: Labels above, buttons below */}
            <div className="block sm:hidden">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{file.name}</h3>
                <p className="text-sm text-gray-600">{convertFileSize(file.size)}</p>
              </div>
              
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <div className="text-white text-4xl font-bold">🎵</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <audio
                  controls
                  className="w-full"
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onLoadedMetadata={handleTimeUpdate}
                >
                  <source src={file.url} type={`audio/${file.extension}`} />
                  Your browser does not support the audio tag.
                </audio>
                
                <div className="flex justify-center gap-3 pt-4">
                  <Button
                    onClick={handleOpenInNewTab}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open
                  </Button>
                  <Button
                    onClick={handleDownload}
                    disabled={isLoading}
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isLoading ? 'Downloading...' : 'Download'}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Desktop/Tablet: Original layout */}
            <div className="hidden sm:block">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <div className="text-white text-4xl font-bold">🎵</div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{file.name}</h3>
                <p className="text-sm text-gray-600">{convertFileSize(file.size)}</p>
              </div>
              
              <div className="space-y-4">
                <audio
                  controls
                  className="w-full"
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onLoadedMetadata={handleTimeUpdate}
                >
                  <source src={file.url} type={`audio/${file.extension}`} />
                  Your browser does not support the audio tag.
                </audio>
                
                <div className="flex justify-center gap-3 pt-4">
                  <Button
                    onClick={handleOpenInNewTab}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open
                  </Button>
                  <Button
                    onClick={handleDownload}
                    disabled={isLoading}
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isLoading ? 'Downloading...' : 'Download'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'document':
        return (
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-500 to-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{file.name}</h3>
              <p className="text-sm text-gray-600 mb-6">{convertFileSize(file.size)}</p>
              <Button onClick={handleOpenInNewTab} className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Document
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-xl p-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-500 to-green-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{file.name}</h3>
              <p className="text-sm text-gray-600 mb-6">{convertFileSize(file.size)}</p>
              <Button onClick={handleOpenInNewTab} className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open File
              </Button>
            </div>
          </div>
        );
    }
  };

  if (!isOpen) return null;

     return (
     <div 
       className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
       onClick={(e) => {
         if (e.target === e.currentTarget) {
           onClose();
         }
       }}
     >
               <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto relative">
         {/* Close button at top edge */}
         <Button
           variant="ghost"
           size="sm"
           onClick={(e) => {
             e.preventDefault();
             e.stopPropagation();
             onClose();
           }}
           className="absolute top-4 right-4 h-8 w-8 p-0 hover:bg-gray-100 z-10"
         >
           <X className="h-4 w-4" />
         </Button>
         
                   {/* Header */}
                      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{file.name}</h2>
                               <div className="flex items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600 whitespace-nowrap overflow-hidden">
                 <span className="truncate">{convertFileSize(file.size)}</span>
                 <span className="flex-shrink-0">•</span>
                 <span className="capitalize truncate">{file.type}</span>
                 <span className="flex-shrink-0">•</span>
                 <span className="truncate">{formatDateTime(file.$createdAt)}</span>
               </div>
              </div>
              
              {/* Mobile: Buttons moved to bottom */}
              <div className="block sm:hidden">
                                 {/* Zoom controls for images on mobile - keep in header */}
                 {file.type === 'image' && (
                   <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mt-12 mr-2">
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={handleZoomOut}
                       disabled={zoomLevel <= 0.5}
                       className="h-6 w-6 p-0 hover:bg-gray-200"
                     >
                       <Minus className="h-3 w-3" />
                     </Button>
                     <span className="text-xs text-gray-600 px-1 min-w-[30px] text-center">
                       {Math.round(zoomLevel * 100)}%
                     </span>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={handleZoomIn}
                       disabled={zoomLevel >= 3}
                       className="h-6 w-6 p-0 hover:bg-gray-200"
                     >
                       <Plus className="h-3 w-3" />
                     </Button>
                   </div>
                 )}
              </div>
              
              {/* Desktop/Tablet: Original layout */}
              <div className="hidden sm:flex items-center gap-2 mr-12">
                {/* Action buttons - only for images and documents */}
                {(file.type === 'image' || file.type === 'document' || file.type === 'other') && (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleOpenInNewTab}
                      variant="outline"
                      size="sm"
                      className="h-8"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open
                    </Button>
                    <Button
                      onClick={handleDownload}
                      disabled={isLoading}
                      size="sm"
                      className="h-8"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isLoading ? 'Downloading...' : 'Download'}
                    </Button>
                  </div>
                )}
                
                {/* Zoom controls for images */}
                {file.type === 'image' && (
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 0.5}
                      className="h-8 w-8 p-0 hover:bg-gray-200"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-gray-600 px-2 min-w-[40px] text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 3}
                      className="h-8 w-8 p-0 hover:bg-gray-200"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

                          {/* Content */}
         <div className="p-4 sm:p-6">
           {renderPreview()}
         </div>
         
         {/* Mobile: Action buttons at bottom */}
         <div className="block sm:hidden">
           {(file.type === 'image' || file.type === 'document' || file.type === 'other') && (
             <div className="border-t border-gray-100 p-4">
               <div className="flex gap-3">
                 <Button
                   onClick={handleOpenInNewTab}
                   variant="outline"
                   size="sm"
                   className="flex-1 h-10"
                 >
                   <ExternalLink className="w-4 h-4 mr-2" />
                   Open
                 </Button>
                 <Button
                   onClick={handleDownload}
                   disabled={isLoading}
                   size="sm"
                   className="flex-1 h-10"
                 >
                   <Download className="w-4 h-4 mr-2" />
                   {isLoading ? 'Downloading...' : 'Download'}
                 </Button>
               </div>
             </div>
           )}
         </div>
      </div>
    </div>
  );
}; 