import { cn } from "@/lib/utils";

export const ButtonMenu: React.FC<{
  isOpen: boolean;
  onClick: () => void;
}> = ({ isOpen, onClick }) => {
  return (
    <button
      className="flex cursor-pointer flex-col space-y-1.5 focus:outline-none"
      onClick={onClick}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <span
        className={cn(
          "bg-foreground h-0.5 w-6 transition-all duration-300 ease-in-out",
          isOpen && "translate-y-2 rotate-45",
        )}
      />
      <span
        className={cn(
          "bg-foreground h-0.5 w-6 transition-all duration-300 ease-in-out",
          isOpen && "opacity-0",
        )}
      />
      <span
        className={cn(
          "bg-foreground h-0.5 w-6 transition-all duration-300 ease-in-out",
          isOpen && "-translate-y-2 -rotate-45",
        )}
      />
    </button>
  );
};
