type Props = {
  message: string;
  variant?: "warning" | "empty" | "loading";
  compact?: boolean;
};

export const AdminStateNotice = ({
  message,
  variant = "empty",
  compact = false,
}: Props) => (
  <div
    className={[
      "admin-state-notice",
      `admin-state-${variant}`,
      compact ? "admin-state-compact" : "",
    ]
      .join(" ")
      .trim()}
  >
    {message}
  </div>
);