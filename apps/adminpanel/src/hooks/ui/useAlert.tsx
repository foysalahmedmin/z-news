import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useCallback, useState } from "react";
import { createRoot } from "react-dom/client";

type ConfirmOptions = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
};

const useAlert = () => {
  return useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      const container = document.createElement("div");
      document.body.appendChild(container);
      const root = createRoot(container);

      const handleClose = (result: boolean) => {
        root.unmount();
        container.remove();
        resolve(result);
      };

      root.render(<ConfirmModal {...options} onClose={handleClose} />);
    });
  }, []);
};

const ConfirmModal = ({
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onClose,
}: ConfirmOptions & { onClose: (result: boolean) => void }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleConfirm = () => {
    setIsOpen(false);
    onClose(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    onClose(false);
  };

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <Modal.Backdrop>
        <Modal.Content size="sm">
          <div className="p-6 text-center">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-muted-foreground mt-2">{message}</p>
            <div className="mt-4 flex justify-center gap-3">
              <Button onClick={handleCancel} variant={"outline"}>
                {cancelText}
              </Button>
              <Button onClick={handleConfirm} className="[--accent:red]">
                {confirmText}
              </Button>
            </div>
          </div>
        </Modal.Content>
      </Modal.Backdrop>
    </Modal>
  );
};

export default useAlert;
