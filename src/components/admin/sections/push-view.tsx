'use client';

import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { spring } from '../ui';

const variants = {
  enter: (detail: boolean) => ({ x: detail ? '100%' : '-30%', opacity: detail ? 1 : 0 }),
  center: { x: 0, opacity: 1 },
  exit: (detail: boolean) => ({ x: detail ? '-30%' : '100%', opacity: detail ? 0 : 1 }),
};

/** A list pushing to its detail view and back, as in an iOS navigation stack. */
export function PushView({
  viewKey,
  isDetail,
  children,
}: {
  viewKey: string;
  isDetail: boolean;
  children: ReactNode;
}) {
  return (
    <AnimatePresence initial={false} mode="popLayout" custom={isDetail}>
      <motion.div
        key={viewKey}
        custom={isDetail}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={spring}
        className="a-push"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
