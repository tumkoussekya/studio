
'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import React from 'react';

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AnimatedCard({ children, className, ...props }: AnimatedCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      {...props}
    >
        <Card className={cn("h-full", className)}>
            {children}
        </Card>
    </motion.div>
  );
}
