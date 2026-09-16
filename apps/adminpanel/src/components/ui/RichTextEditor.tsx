import type { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  createReactBlockSpec,
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import { useCallback, useEffect, useState } from "react";

import FileSelectionModal from "@/components/modals/FileSelectionModal";
import { Button } from "@/components/ui/Button";
import useSetting from "@/hooks/states/useSetting";
import { createFile, fetchFile } from "@/services/file.service";
import { parseYouTubeUrl } from "@/utils/youtubeUrlUtils";
import { File, Youtube } from "lucide-react";

// File Select block - opens file selection modal
const fileSelectBlock = createReactBlockSpec(
  {
    type: "fileSelect",
    propSchema: {
      fileId: {
        default: "",
      },
      fileType: {
        default: "all" as "image" | "video" | "all",
      },
    },
    content: "none",
  },
  {
    render: ({ block }) => {
      const fileId = (block.props as { fileId: string }).fileId;
      if (!fileId) {
        return (
          <div className="bg-muted/50 flex items-center justify-center rounded-lg border-2 border-dashed p-8">
            <div className="text-center">
              <File className="text-muted-foreground mx-auto mb-2 h-12 w-12" />
              <p className="text-muted-foreground text-sm">
                No file selected. Click to select a file.
              </p>
            </div>
          </div>
        );
      }
      // File will be inserted by the modal handler
      return null;
    },
    toExternalHTML: () => null,
  },
);

// Create YouTube embed block spec
const youtubeEmbedBlock = createReactBlockSpec(
  {
    type: "youtubeEmbed",
    propSchema: {
      url: {
        default: "",
      },
    },
    content: "none",
  },
  {
    render: ({ block }) => {
      const url = (block.props as { url: string }).url;
      if (!url) {
        return (
          <div className="bg-muted/50 flex items-center justify-center rounded-lg border-2 border-dashed p-8">
            <div className="text-center">
              <Youtube className="text-muted-foreground mx-auto mb-2 h-12 w-12" />
              <p className="text-muted-foreground text-sm">
                No YouTube URL provided
              </p>
            </div>
          </div>
        );
      }

      const parsed = parseYouTubeUrl(url);
      if (!parsed.id) {
        return (
          <div className="bg-destructive/10 flex items-center justify-center rounded-lg border-2 border-dashed p-8">
            <p className="text-destructive text-sm">
              Invalid YouTube URL: {url}
            </p>
          </div>
        );
      }

      const embedUrl = `https://www.youtube.com/embed/${parsed.id}`;

      return (
        <div className="my-4">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={embedUrl}
              className="absolute top-0 left-0 h-full w-full rounded-lg"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      );
    },
    toExternalHTML: ({ block }) => {
      const url = (block.props as { url: string }).url;
      if (!url) return null;

      const parsed = parseYouTubeUrl(url);
      if (!parsed.id) return null;

      const embedUrl = `https://www.youtube.com/embed/${parsed.id}`;
      return `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1rem 0;">
        <iframe
          src="${embedUrl}"
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>`;
    },
  },
);

// Create schema with custom blocks
const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    fileSelect: fileSelectBlock,
    youtubeEmbed: youtubeEmbedBlock,
  },
});

export interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  error?: string;
  initialContent?: any[];
  uploadFileCategory?: string;
  minHeight?: string;
}

const RichTextEditor = ({
  value,
  onChange,
  error,
  initialContent,
  uploadFileCategory = "news-content",
  minHeight = "350px",
}: RichTextEditorProps) => {
  const { setting } = useSetting();
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [fileModalType, setFileModalType] = useState<"image" | "video" | "all">(
    "all",
  );
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);

  // Create editor
  const blockNoteEditor = useCreateBlockNote({
    schema,
    initialContent: initialContent || [
      {
        type: "paragraph",
        content: "",
      },
    ],
    domAttributes: {
      editor: {
        style: `min-height: ${minHeight}; padding-top: 1rem; padding-bottom: 1rem;`,
      },
    },
    // Upload file to backend and return URL
    uploadFile: async (file: File): Promise<string> => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", uploadFileCategory);

        const response = await createFile(formData);

        if (response.data?.url) {
          return response.data.url;
        }

        throw new Error("File upload failed: No URL returned");
      } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
      }
    },
  });

  const handleFileSelect = useCallback(
    async (fileId: string | string[] | null) => {
      if (!fileId || Array.isArray(fileId)) {
        // If cancelled, remove any fileSelect placeholder blocks
        const blocks = blockNoteEditor.document;
        const fileSelectBlocks = blocks.filter(
          (block) => block.type === "fileSelect",
        );
        if (fileSelectBlocks.length > 0) {
          const lastFileSelect = fileSelectBlocks[fileSelectBlocks.length - 1];
          blockNoteEditor.removeBlocks([lastFileSelect]);
        }
        setIsFileModalOpen(false);
        return;
      }

      try {
        const { data: fileData } = await fetchFile(fileId);
        if (!fileData) {
          setIsFileModalOpen(false);
          return;
        }

        const file = fileData;
        const fileUrl = file.url;

        // Find and replace fileSelect placeholder blocks
        const blocks = blockNoteEditor.document;
        const fileSelectBlocks = blocks.filter(
          (block) => block.type === "fileSelect",
        );

        if (fileSelectBlocks.length > 0) {
          const lastFileSelect = fileSelectBlocks[fileSelectBlocks.length - 1];
          blockNoteEditor.removeBlocks([lastFileSelect]);

          // Insert image or video block based on file type
          if (file.metadata?.file_type === "image") {
            blockNoteEditor.insertBlocks(
              [
                {
                  type: "image",
                  props: {
                    url: fileUrl,
                    caption: file.caption || "",
                  },
                },
              ],
              lastFileSelect.id,
              "after",
            );
          } else if (file.metadata?.file_type === "video") {
            blockNoteEditor.insertBlocks(
              [
                {
                  type: "paragraph",
                  content: "",
                },
              ],
              lastFileSelect.id,
              "after",
            );
            const videoHtml = `<video controls src="${fileUrl}" style="max-width: 100%; height: auto;"></video>`;
            const htmlBlocks =
              await blockNoteEditor.tryParseHTMLToBlocks(videoHtml);
            if (htmlBlocks.length > 0) {
              blockNoteEditor.insertBlocks(
                htmlBlocks,
                lastFileSelect.id,
                "after",
              );
            }
          } else {
            blockNoteEditor.insertBlocks(
              [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "link",
                      href: fileUrl,
                      content: file.name,
                    },
                  ],
                },
              ],
              lastFileSelect.id,
              "after",
            );
          }
        } else {
          // No placeholder found, insert at cursor position
          const currentBlock = blockNoteEditor.getTextCursorPosition().block;

          if (file.metadata?.file_type === "image") {
            blockNoteEditor.insertBlocks(
              [
                {
                  type: "image",
                  props: {
                    url: fileUrl,
                    caption: file.caption || "",
                  },
                },
              ],
              currentBlock.id,
              "after",
            );
          } else if (file.metadata?.file_type === "video") {
            blockNoteEditor.insertBlocks(
              [
                {
                  type: "paragraph",
                  content: "",
                },
              ],
              currentBlock.id,
              "after",
            );
            const videoHtml = `<video controls src="${fileUrl}" style="max-width: 100%; height: auto;"></video>`;
            const htmlBlocks =
              await blockNoteEditor.tryParseHTMLToBlocks(videoHtml);
            if (htmlBlocks.length > 0) {
              blockNoteEditor.insertBlocks(
                htmlBlocks,
                currentBlock.id,
                "after",
              );
            }
          } else {
            blockNoteEditor.insertBlocks(
              [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "link",
                      href: fileUrl,
                      content: file.name,
                    },
                  ],
                },
              ],
              currentBlock.id,
              "after",
            );
          }
        }

        setIsFileModalOpen(false);
      } catch (error) {
        console.error("Error inserting file:", error);
      }
    },
    [blockNoteEditor],
  );

  const handleYoutubeEmbed = useCallback(() => {
    if (!youtubeUrl.trim()) {
      const blocks = blockNoteEditor.document;
      const youtubeBlocks = blocks.filter(
        (block) =>
          block.type === "youtubeEmbed" &&
          !(block.props as { url: string }).url,
      );
      if (youtubeBlocks.length > 0) {
        const lastYoutube = youtubeBlocks[youtubeBlocks.length - 1];
        blockNoteEditor.removeBlocks([lastYoutube]);
      }
      setIsYoutubeModalOpen(false);
      setYoutubeUrl("");
      return;
    }

    const parsed = parseYouTubeUrl(youtubeUrl.trim());
    if (!parsed.id) {
      alert("Invalid YouTube URL. Please enter a valid YouTube video URL.");
      return;
    }

    const blocks = blockNoteEditor.document;
    const youtubeBlocks = blocks.filter(
      (block) =>
        block.type === "youtubeEmbed" && !(block.props as { url: string }).url,
    );

    if (youtubeBlocks.length > 0) {
      const lastYoutube = youtubeBlocks[youtubeBlocks.length - 1];
      blockNoteEditor.updateBlock(lastYoutube, {
        props: {
          url: youtubeUrl.trim(),
        },
      });
    } else {
      const currentBlock = blockNoteEditor.getTextCursorPosition().block;
      blockNoteEditor.insertBlocks(
        [
          {
            type: "youtubeEmbed",
            props: {
              url: youtubeUrl.trim(),
            },
          },
        ],
        currentBlock.id,
        "after",
      );
    }

    setYoutubeUrl("");
    setIsYoutubeModalOpen(false);
  }, [blockNoteEditor, youtubeUrl]);

  // Custom Slash Menu items
  const insertFileSelectItem = useCallback(
    (editor: BlockNoteEditor<any>) => ({
      title: "File Select",
      onItemClick: () => {
        setFileModalType("all");
        setIsFileModalOpen(true);
        const currentBlock = editor.getTextCursorPosition().block;
        editor.insertBlocks(
          [
            {
              type: "fileSelect",
              props: {
                fileId: "",
                fileType: "all",
              },
            },
          ],
          currentBlock.id,
          "after",
        );
      },
      aliases: ["file", "select file", "file select"],
      group: "Customs",
      icon: <File size={18} />,
      subtext: "Select a file from your library",
    }),
    [],
  );

  const insertYouTubeItem = useCallback(
    (editor: BlockNoteEditor<any>) => ({
      title: "YouTube",
      onItemClick: () => {
        setIsYoutubeModalOpen(true);
        const currentBlock = editor.getTextCursorPosition().block;
        editor.insertBlocks(
          [
            {
              type: "youtubeEmbed",
              props: {
                url: "",
              },
            },
          ],
          currentBlock.id,
          "after",
        );
      },
      aliases: ["youtube", "video", "embed", "youtube embed"],
      group: "Customs",
      icon: <Youtube size={18} />,
      subtext: "Embed a YouTube video",
    }),
    [],
  );

  // List containing all default Slash Menu Items, as well as our custom ones
  const getCustomSlashMenuItems = useCallback(() => {
    return [
      ...getDefaultReactSlashMenuItems(blockNoteEditor),
      insertFileSelectItem(blockNoteEditor),
      insertYouTubeItem(blockNoteEditor),
    ];
  }, [blockNoteEditor, insertFileSelectItem, insertYouTubeItem]);

  // Sync value prop with editor
  useEffect(() => {
    if (value !== undefined) {
      blockNoteEditor
        .blocksToHTMLLossy(blockNoteEditor.document)
        .then((currentHtml) => {
          if (currentHtml !== value) {
            blockNoteEditor.tryParseHTMLToBlocks(value).then((blocks) => {
              blockNoteEditor.replaceBlocks(blockNoteEditor.document, blocks);
            });
          }
        });
    }
  }, [value, blockNoteEditor]);

  // Listen for block changes to detect fileSelect or youtubeEmbed blocks
  useEffect(() => {
    const handleChange = () => {
      const blocks = blockNoteEditor.document;

      // Check for fileSelect blocks with empty fileId
      const emptyFileSelectBlocks = blocks.filter(
        (block) =>
          block.type === "fileSelect" &&
          !(block.props as { fileId: string }).fileId,
      );
      if (emptyFileSelectBlocks.length > 0 && !isFileModalOpen) {
        setFileModalType("all");
        setIsFileModalOpen(true);
      }

      // Check for youtubeEmbed blocks with empty url
      const emptyYoutubeBlocks = blocks.filter(
        (block) =>
          block.type === "youtubeEmbed" &&
          !(block.props as { url: string }).url,
      );
      if (emptyYoutubeBlocks.length > 0 && !isYoutubeModalOpen) {
        setIsYoutubeModalOpen(true);
      }
    };

    if (blockNoteEditor.onChange) {
      const unsubscribe = blockNoteEditor.onChange(handleChange);
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [blockNoteEditor, isFileModalOpen, isYoutubeModalOpen]);

  return (
    <>
      <div className="rounded-md border p-2">
        <BlockNoteView
          theme={setting?.theme === "dark" ? "dark" : "light"}
          editor={blockNoteEditor}
          slashMenu={false}
          onChange={() => {
            blockNoteEditor
              .blocksToHTMLLossy(blockNoteEditor.document)
              .then((html) => {
                onChange?.(html);
              });
          }}
        >
          <SuggestionMenuController
            triggerCharacter="/"
            getItems={async (query: string) => {
              const allItems = getCustomSlashMenuItems();
              if (!query) return allItems;
              const lowerQuery = query.toLowerCase();
              return allItems.filter((item) => {
                const title = (item as any).title?.toLowerCase() || "";
                const subtext = (item as any).subtext?.toLowerCase() || "";
                const aliases = (item as any).aliases || [];
                return (
                  title.includes(lowerQuery) ||
                  subtext.includes(lowerQuery) ||
                  aliases.some((alias: string) =>
                    alias.toLowerCase().includes(lowerQuery),
                  )
                );
              });
            }}
            onItemClick={(item) => {
              if ((item as any).onItemClick) {
                (item as any).onItemClick();
              }
            }}
          />
        </BlockNoteView>
      </div>
      {error && <p className="text-destructive mt-1 text-sm">{error}</p>}

      <FileSelectionModal
        isOpen={isFileModalOpen}
        setIsOpen={setIsFileModalOpen}
        value={null}
        onChange={handleFileSelect}
        type={fileModalType}
        title={`Select ${fileModalType === "all" ? "File" : fileModalType === "image" ? "Image" : "Video"}`}
      />

      {/* YouTube Embed Modal */}
      {isYoutubeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background w-full max-w-md rounded-lg border p-6">
            <div className="mb-4 flex items-center gap-2">
              <Youtube className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Embed YouTube Video</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  YouTube URL
                </label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-md border px-3 py-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleYoutubeEmbed();
                    }
                  }}
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  Paste a YouTube video URL or video ID
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsYoutubeModalOpen(false);
                    setYoutubeUrl("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleYoutubeEmbed}
                  disabled={!youtubeUrl.trim()}
                >
                  Embed
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RichTextEditor;
