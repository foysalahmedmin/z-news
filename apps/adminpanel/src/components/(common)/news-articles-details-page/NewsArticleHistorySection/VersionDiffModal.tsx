import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { TArticleVersion, TNews } from "@/types/news.type";
import { Eye, FileText, Type } from "lucide-react";

type VersionDiffModalProps = {
  isOpen: boolean;
  onClose: () => void;
  version: TArticleVersion | null;
  currentNews: TNews;
};

const VersionDiffModal: React.FC<VersionDiffModalProps> = ({
  isOpen,
  onClose,
  version,
  currentNews,
}) => {
  if (!version) return null;

  const metadata = version.metadata_snapshot;

  return (
    <Modal isOpen={isOpen} setIsOpen={onClose} size="xl">
      <Modal.Backdrop />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-500" />
            Comparison: Version {version.version_number} vs Current
          </Modal.Title>
          <Modal.Close />
        </Modal.Header>

        <Modal.Body className="max-h-[70vh] space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Metadata Comparison */}
            <div className="space-y-4">
              <h4 className="text-muted-foreground flex items-center gap-2 text-sm font-bold uppercase">
                <Type className="h-4 w-4" /> Version {version.version_number}{" "}
                Metadata
              </h4>
              <div className="bg-muted/30 space-y-2 rounded-lg border p-3">
                <div>
                  <span className="text-muted-foreground block text-xs font-semibold">
                    Title
                  </span>
                  <p className="text-sm">{metadata.title}</p>
                </div>
                {metadata.sub_title && (
                  <div>
                    <span className="text-muted-foreground block text-xs font-semibold">
                      Sub Title
                    </span>
                    <p className="text-sm">{metadata.sub_title}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground block text-xs font-semibold">
                    Slug
                  </span>
                  <p className="font-mono text-xs">{metadata.slug}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-muted-foreground flex items-center gap-2 text-sm font-bold uppercase">
                <Type className="h-4 w-4" /> Current Metadata
              </h4>
              <div className="space-y-2 rounded-lg border border-blue-100 bg-blue-50/30 p-3">
                <div>
                  <span className="block text-xs font-semibold text-blue-600">
                    Title
                  </span>
                  <p className="text-sm">{currentNews.title}</p>
                </div>
                {currentNews.sub_title && (
                  <div>
                    <span className="block text-xs font-semibold text-blue-600">
                      Sub Title
                    </span>
                    <p className="text-sm">{currentNews.sub_title}</p>
                  </div>
                )}
                <div>
                  <span className="block text-xs font-semibold text-blue-600">
                    Slug
                  </span>
                  <p className="font-mono text-xs">{currentNews.slug}</p>
                </div>
              </div>
            </div>
          </div>

          <hr />

          {/* Content Comparison */}
          <div className="space-y-4">
            <h4 className="text-muted-foreground flex items-center gap-2 text-sm font-bold uppercase">
              <FileText className="h-4 w-4" /> Content Snapshots
            </h4>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-muted/10 h-[400px] overflow-y-auto rounded-lg border p-4">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: version.content_snapshot }}
                />
              </div>
              <div className="h-[400px] overflow-y-auto rounded-lg border border-blue-50 bg-blue-50/10 p-4">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentNews.content }}
                />
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};

export default VersionDiffModal;
