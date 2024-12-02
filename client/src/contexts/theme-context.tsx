import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Define types for theme context
interface ThemeContextType {
  theme: {
    colors: {
      background: string;
      primary: string;
      text: string;
    };
  };
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Define props type for ThemeProvider
interface ThemeProviderProps {
  children: ReactNode;
}

// Create context with default values
const defaultContext: ThemeContextType = {
  theme: {
    colors: {
      background: "white",
      primary: "white",
      text: "black",
    },
  },
  isDarkMode: false,
  toggleTheme: () => {},
};

const ThemeContext = createContext<ThemeContextType>(defaultContext);

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme from localStorage if available, otherwise default to light
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return false;
  });

  // Theme values utilizing Tailwind's customDark
  const theme = {
    colors: {
      background: isDarkMode ? "bg-customDark" : "bg-white",
      primary: isDarkMode ? "bg-customDark" : "bg-white",
      text: isDarkMode ? "text-white" : "text-black",
    },
  };

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Update localStorage and body class when theme changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
      // Add or remove dark class from body
      document.body.classList.toggle("dark", isDarkMode);
      // Add or remove background color
      document.body.className = isDarkMode ? "bg-customDark" : "bg-white";
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
