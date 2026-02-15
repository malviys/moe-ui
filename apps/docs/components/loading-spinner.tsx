interface LoadingSpinnerProps {
  /**
   * The color theme for the spinner
   * @default "yellow"
   */
  color?: "yellow" | "orange" | "blue" | "green";

  /**
   * The text to display below the spinner
   * @default "Loading..."
   */
  text?: string;

  /**
   * The minimum height of the container
   * @default "60vh"
   */
  minHeight?: string;

  /**
   * Size of the spinner
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
}

const colorClasses = {
  yellow: {
    border: "border-yellow-500/20",
    spinner: "border-t-yellow-500",
  },
  orange: {
    border: "border-orange-500/20",
    spinner: "border-t-orange-500",
  },
  blue: {
    border: "border-blue-500/20",
    spinner: "border-t-blue-500",
  },
  green: {
    border: "border-green-500/20",
    spinner: "border-t-green-500",
  },
};

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-16 h-16",
  lg: "w-24 h-24",
};

export function LoadingSpinner({
  color = "yellow",
  text = "Loading...",
  minHeight = "60vh",
  size = "md",
}: Readonly<LoadingSpinnerProps>) {
  const colors = colorClasses[color];
  const sizeClass = sizeClasses[size];

  return (
    <div className="flex items-center justify-center" style={{ minHeight }}>
      <div className="flex flex-col items-center gap-4">
        {/* Animated spinner with gradient */}
        <div className={`relative ${sizeClass}`}>
          <div
            className={`absolute inset-0 rounded-full border-4 ${colors.border}`}
          ></div>
          <div
            className={`absolute inset-0 rounded-full border-4 border-transparent ${colors.spinner} animate-spin`}
          ></div>
        </div>

        {/* Loading text with fade animation */}
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      </div>
    </div>
  );
}
