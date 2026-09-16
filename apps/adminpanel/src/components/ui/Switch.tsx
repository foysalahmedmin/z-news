import React from "react";

type SwitchProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
};

export const Switch: React.FC<SwitchProps> = ({
  id,
  checked = false,
  onChange,
  disabled = false,
  label,
}) => {
  return (
    <label className="flex cursor-pointer items-center gap-2 select-none">
      <div className="relative inline-flex items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className="peer sr-only"
        />
        <div className="bg-muted-foreground/50 peer-checked:bg-accent peer-focus:ring-accent h-6 w-11 rounded-full transition-colors peer-focus:ring-1" />
        <div className="bg-card absolute top-0.5 left-0.5 h-5 w-5 transform rounded-full shadow-md transition-transform peer-checked:translate-x-5" />
      </div>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
};
