import Button from "@/components/ui/Button";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Thin aliases over the single global Button component (components/ui/Button.tsx),
 * kept so every existing tool page can keep using the short `PrimaryButton` /
 * `OutlineButton` names without each one re-picking variant/size by hand.
 */
export function PrimaryButton({ children, onClick, disabled, className }: ButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled} className={className} variant="primary" size="md">
      {children}
    </Button>
  );
}

export function OutlineButton({ children, onClick, disabled, className }: ButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled} className={className} variant="outline" size="md">
      {children}
    </Button>
  );
}
