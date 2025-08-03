"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import Image from "next/image";
import { Models } from "node-appwrite";
import { actionsDropdownItems } from "@/constants";
import Link from "next/link";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  deleteFile,
  renameFile,
  updateFileUsers,
} from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";
import { FileDetails, ShareInput } from "@/components/ActionsModalContent";
import { InlinePreview } from "@/components/InlinePreview";

const ActionDropdown = ({ file }: { file: Models.Document }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [name, setName] = useState(file.name);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);

  const path = usePathname();

  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsPreviewOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name);
    //   setEmails([]);
  };

  const handleAction = async () => {
    if (!action) return;
    setIsLoading(true);
    let success = false;

    const actions = {
      rename: () =>
        renameFile({ fileId: file.$id, name, extension: file.extension, path }),
      share: () => updateFileUsers({ fileId: file.$id, emails, path }),
      delete: () =>
        deleteFile({ fileId: file.$id, bucketFileId: file.bucketFileId, path }),
    };

    success = await actions[action.value as keyof typeof actions]();

    if (success) closeAllModals();

    setIsLoading(false);
  };

  const handleRemoveUser = async (email: string) => {
    const updatedEmails = emails.filter((e) => e !== email);

    const success = await updateFileUsers({
      fileId: file.$id,
      emails: updatedEmails,
      path,
    });

    if (success) setEmails(updatedEmails);
    closeAllModals();
  };

  const renderDialogContent = () => {
    if (!action) return null;

    const { value, label } = action;

    return (
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            {label}
          </DialogTitle>
          {value === "rename" && (
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          {value === "details" && <FileDetails file={file} />}
          {value === "share" && (
            <ShareInput
              file={file}
              onInputChange={setEmails}
              onRemove={handleRemoveUser}
            />
          )}
          {value === "delete" && (
            <p className="delete-confirmation">
              Are you sure you want to delete{` `}
              <span className="delete-file-name">{file.name}</span>?
            </p>
          )}
        </DialogHeader>
        {["rename", "delete", "share"].includes(value) && (
          <DialogFooter className="flex flex-col gap-3 md:flex-row">
            <Button onClick={closeAllModals} className="modal-cancel-button">
              Cancel
            </Button>
            <Button onClick={handleAction} className="modal-submit-button">
              <p className="capitalize">{value}</p>
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="animate-spin"
                />
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  };

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <InlinePreview 
          file={file} 
          isOpen={isPreviewOpen} 
          onClose={() => setIsPreviewOpen(false)} 
        />
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src="/assets/icons/dots.svg"
            alt="dots"
            width={24}
            height={24}
            className="sm:w-[34px] sm:h-[34px] md:w-[34px] md:h-[34px]"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-[200px] truncate">
            {file.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((actionItem) => (
            <DropdownMenuItem
              key={actionItem.value}
              className="shad-dropdown-item"
              onClick={() => {
                setAction(actionItem);

                if (actionItem.value === "preview") {
                  setIsPreviewOpen(true);
                } else if (
                  ["rename", "share", "delete", "details"].includes(
                    actionItem.value,
                  )
                ) {
                  setIsModalOpen(true);
                }
              }}
            >
                             {actionItem.value === "download" ? (
                 <button
                   onClick={async () => {
                     try {
                       // Use the same download URL logic as InlinePreview
                       const downloadUrl = file.bucketFileId ? 
                         `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET}/files/${file.bucketFileId}/download?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}` :
                         file.url;
                       
                       const response = await fetch(downloadUrl);
                       if (!response.ok) {
                         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
                       
                       const blob = await response.blob();
                       const mimeType = getMimeType(file.extension);
                       const finalBlob = new Blob([blob], { type: mimeType });
                       
                       const url = window.URL.createObjectURL(finalBlob);
                       const a = document.createElement('a');
                       a.href = url;
                       a.download = file.name;
                       a.style.display = 'none';
                       document.body.appendChild(a);
                       a.click();
                       setTimeout(() => {
                         window.URL.revokeObjectURL(url);
                         document.body.removeChild(a);
                       }, 100);
                     } catch (error) {
                       console.error('Download failed:', error);
                       // Fallback: open in new tab
                       const fallbackUrl = file.bucketFileId ? 
                         `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET}/files/${file.bucketFileId}/download?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}` :
                         file.url;
                       window.open(fallbackUrl, '_blank');
                     }
                   }}
                   className="flex items-center gap-2 w-full text-left"
                 >
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={20}
                    height={20}
                    className="sm:w-[30px] sm:h-[30px] md:w-[30px] md:h-[30px]"
                  />
                  {actionItem.label}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={20}
                    height={20}
                    className="sm:w-[30px] sm:h-[30px] md:w-[30px] md:h-[30px]"
                  />
                  {actionItem.label}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {renderDialogContent()}
    </Dialog>
    </>
  );
};
export default ActionDropdown;
