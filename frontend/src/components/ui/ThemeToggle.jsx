import { Moon, Sun } from "lucide-react";
import LoadingButton from "./LoadingButton";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = () => {
  const { toggleTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <LoadingButton
      type="button"
      variant="outline"
      onClick={toggleTheme}
      className="h-10 rounded-full px-3 py-0 text-xs font-medium"
    >
      <span className="flex items-center gap-2">
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        {isDark ? "Dark mode" : "Light mode"}
      </span>
    </LoadingButton>
  );
};

export default ThemeToggle;


