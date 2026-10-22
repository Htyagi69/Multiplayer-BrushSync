"use client";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button"; // Wrap it in shadcn's button styles

const ToggleTheme = ({ theme, setTheme }) => {
  return (
    <Button
      onClick={() =>{
        const nextTheme=!theme
        setTheme(nextTheme)
        localStorage.setItem("theme",nextTheme)
      }}
      aria-label="Toggle theme"
      type="button"
      variant="ghost" // Matches standard shadcn styling
      size="icon"
      className="mt-2"
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[1.2rem] w-[1.2rem]"
        initial={false}
        animate={{
          rotate: theme ? 40 : 0,
        }}
        transition={{ type: "spring", stiffness: 220, damping: 15 }}
      >
        <mask id="moon-mask-01">
          <rect x="0" y="0" width="24" height="24" fill="white" />
          <motion.circle
            cx={25}
            cy={0}
            r={8}
            fill="black"
            initial={false}
            animate={{
              cx: theme ? 18 : 25,
              cy: theme ? 6 : 0,
            }}
            transition={{ type: "spring", stiffness: 220, damping: 15 }}
          />
        </mask>

        <motion.circle
          cx={12}
          cy={12}
          r={9}
          fill="currentColor"
          mask="url(#moon-mask-01)"
          initial={false}
          animate={{
            r: theme ? 8 : 5,
          }}
          transition={{ type: "spring", stiffness: 220, damping: 15 }}
        />

        <motion.g
          stroke="currentColor"
          initial={false}
          animate={{
            opacity: theme ? 0 : 1,
            scale: theme ? 0.3 : 1,
          }}
          transition={{ type: "spring", stiffness: 220, damping: 15 }}
        >
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </motion.g>
      </motion.svg>
    </Button>
  );
};

export default ToggleTheme;
