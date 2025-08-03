"use client";

import { useState } from "react";
import { Models } from "node-appwrite";
import Link from "next/link";
import Thumbnail from "@/components/Thumbnail";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "@/components/FormattedDateTime";
import ActionDropdown from "@/components/ActionDropdown";
import { InlinePreview } from "@/components/InlinePreview";

const Card = ({ file }: { file: Models.Document }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleFileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (file.type === 'image' || file.type === 'video' || file.type === 'audio') {
      // Open preview modal for media files
      setIsPreviewOpen(true);
    } else {
      // For documents and other files, open in new tab
      window.open(file.url, '_blank');
    }
  };

  return (
    <>
      <div 
        className="file-card cursor-pointer"
        onClick={handleFileClick}
      >
      {/* Mobile Layout */}
      <div className="flex justify-between sm:hidden">
        <div className="flex items-start gap-1 flex-1 min-w-0">
          <Thumbnail
            type={file.type}
            extension={file.extension}
            url={file.url}
            className="!size-8 flex-shrink-0"
            imageClassName="!size-4"
          />
                     <div className="flex-1 min-w-0">
             <p className="subtitle-2 line-clamp-1 text-xs truncate">{file.name}</p>
             <div className="flex items-center gap-1 mt-1">
               <FormattedDateTime
                 date={file.$createdAt}
                 className="text-xs text-light-100"
               />
               <span className="text-xs text-light-200">•</span>
               <p className="text-xs text-light-200 line-clamp-1 truncate">
                 {file.owner?.fullName || "Unknown"}
               </p>
             </div>
           </div>
        </div>

        <div className="flex flex-col items-end justify-end">
          <ActionDropdown file={file} />
          <p className="text-xs text-light-100 mt-auto">{convertFileSize(file.size)}</p>
        </div>
      </div>

             {/* PC Layout */}
       <div className="hidden sm:flex sm:justify-between">
         <Thumbnail
           type={file.type}
           extension={file.extension}
           url={file.url}
           className="!size-20 flex-shrink-0"
           imageClassName="!size-11"
         />
         <div className="flex flex-col items-end justify-end">
           <ActionDropdown file={file} />
           <p className="text-xs text-light-100 mt-auto">{convertFileSize(file.size)}</p>
         </div>
       </div>

       <div className="file-card-details">
         <div className="hidden sm:block">
           <p className="subtitle-2 line-clamp-1 text-base truncate">{file.name}</p>
         </div>
         <div className="hidden sm:flex sm:flex-col sm:gap-1">
           <FormattedDateTime
             date={file.$createdAt}
             className="body-2 text-light-100 text-sm"
           />
           <p className="caption line-clamp-1 text-light-200 text-xs truncate">
             By: {file.owner?.fullName || "Unknown"}
           </p>
         </div>
       </div>
      </div>
      
      <InlinePreview 
        file={file} 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
      />
    </>
  );
};
export default Card;
