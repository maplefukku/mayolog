"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

const easeOut: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export const fadeInUp: HTMLMotionProps<"div"> = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: easeOut },
};

export const staggerContainer: HTMLMotionProps<"div"> = {
  initial: "hidden",
  animate: "visible",
  variants: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  },
};

export const staggerItem: HTMLMotionProps<"div"> = {
  variants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: easeOut },
    },
  },
};

export const FadeInUp = motion.div;
export const MotionSection = motion.section;
