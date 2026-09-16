"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { TNews } from "@/types/news.type";
import { Check, Copy as CopyIcon, Share2 } from "lucide-react";
import React, { useState } from "react";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";

type ReactionProps = {
  news: Partial<TNews>;
  className?: string;
};

const Share: React.FC<ReactionProps> = ({ news, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/news/${news.slug}`
      : "";

  const handleCopy = () => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div
      className={cn(
        "bg-muted flex h-10 items-center rounded-md p-1",
        className,
      )}
    >
      {/* Share Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-full cursor-pointer items-center gap-1 px-2"
      >
        <Share2 className={cn("size-5")} />
      </button>

      {/* Modal */}
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <Modal.Backdrop>
          <Modal.Content size={"sm"} className="my-auto">
            <Modal.Header>
              <Modal.Title>শেয়ার</Modal.Title>
              <Modal.Close size={"sm"} />
            </Modal.Header>
            <Modal.Body>
              <div className="space-y-6">
                <p className="text-muted-foreground text-center">
                  সংবাদটি শেয়ার করুন
                </p>

                {/* Social share buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <FacebookShareButton url={url}>
                    <FacebookIcon size={32} round />
                  </FacebookShareButton>
                  <TwitterShareButton url={url}>
                    <TwitterIcon size={32} round />
                  </TwitterShareButton>
                  <LinkedinShareButton url={url}>
                    <LinkedinIcon size={32} round />
                  </LinkedinShareButton>
                  <WhatsappShareButton url={url}>
                    <WhatsappIcon size={32} round />
                  </WhatsappShareButton>
                </div>

                {/* Copy Link input */}
                <div className="flex overflow-hidden rounded-md border">
                  <input
                    className="flex-1 self-stretch px-2 text-sm outline-none"
                    type="text"
                    value={url}
                    readOnly
                  />
                  <Button
                    className="primary rounded-s-none border"
                    shape={"icon"}
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="size-4" />
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Modal.Body>
          </Modal.Content>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
};

export default Share;
