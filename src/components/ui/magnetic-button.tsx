"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export const MagneticButton = ({
  children,
  className,
  intensity = 0.5,
  springOptions = { type: "spring", stiffness: 150, damping: 15, mass: 0.1 },
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  springOptions?: any;
  onClick?: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * intensity, y: middleY * intensity });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={springOptions}
      className={`inline-block ${className || ""}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
