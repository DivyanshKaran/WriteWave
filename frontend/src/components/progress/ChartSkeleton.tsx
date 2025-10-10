"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ChartSkeletonProps {
  type: 'line' | 'bar' | 'radar' | 'heatmap' | 'timeline' | 'insights' | 'comparative';
  className?: string;
}

export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ type, className = '' }) => {
  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: { x: '100%' },
  };

  const SkeletonBar = ({ width, height, delay = 0 }: { width: string; height: string; delay?: number }) => (
    <motion.div
      className="relative overflow-hidden bg-gray-200 border-base"
      style={{ width, height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
        variants={shimmerVariants}
        initial="initial"
        animate="animate"
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
          delay,
        }}
      />
    </motion.div>
  );

  const SkeletonCircle = ({ size, delay = 0 }: { size: string; delay?: number }) => (
    <motion.div
      className="relative overflow-hidden bg-gray-200 border-base rounded-full"
      style={{ width: size, height: size }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
        variants={shimmerVariants}
        initial="initial"
        animate="animate"
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
          delay,
        }}
      />
    </motion.div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'line':
        return (
          <div className="space-y-4">
            <div className="flex justify-between">
              <SkeletonBar width="120px" height="20px" />
              <SkeletonBar width="80px" height="20px" />
            </div>
            <div className="space-y-3">
              <SkeletonBar width="100%" height="200px" />
              <div className="flex gap-4">
                <SkeletonBar width="60px" height="16px" />
                <SkeletonBar width="80px" height="16px" />
                <SkeletonBar width="70px" height="16px" />
              </div>
            </div>
          </div>
        );

      case 'bar':
        return (
          <div className="space-y-4">
            <SkeletonBar width="150px" height="24px" />
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <SkeletonBar width="80px" height="16px" />
                    <SkeletonBar width="40px" height="16px" />
                  </div>
                  <SkeletonBar width="100%" height="24px" delay={i * 0.1} />
                </div>
              ))}
            </div>
          </div>
        );

      case 'radar':
        return (
          <div className="space-y-4">
            <div className="flex justify-between">
              <SkeletonBar width="120px" height="24px" />
              <div className="flex gap-2">
                <SkeletonBar width="50px" height="24px" />
                <SkeletonBar width="50px" height="24px" />
              </div>
            </div>
            <div className="flex justify-center">
              <SkeletonCircle size="300px" />
            </div>
            <div className="flex gap-4 justify-center">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-2">
                  <SkeletonCircle size="12px" delay={i * 0.1} />
                  <SkeletonBar width="60px" height="16px" delay={i * 0.1} />
                </div>
              ))}
            </div>
          </div>
        );

      case 'heatmap':
        return (
          <div className="space-y-4">
            <div className="flex justify-between">
              <SkeletonBar width="120px" height="24px" />
              <SkeletonBar width="80px" height="16px" />
            </div>
            <div className="space-y-2">
              <div className="flex gap-1">
                {Array.from({ length: 52 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <SkeletonBar
                        key={j}
                        width="12px"
                        height="12px"
                        delay={(i * 7 + j) * 0.01}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs">
                <SkeletonBar width="60px" height="12px" />
                <SkeletonBar width="40px" height="12px" />
              </div>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-4">
            <SkeletonBar width="150px" height="24px" />
            <div className="space-y-6">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-start gap-4">
                  <SkeletonCircle size="32px" delay={i * 0.1} />
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <SkeletonBar width="80px" height="12px" delay={i * 0.1} />
                      <SkeletonBar width="60px" height="12px" delay={i * 0.1} />
                    </div>
                    <SkeletonBar width="120px" height="16px" delay={i * 0.1} />
                    <SkeletonBar width="200px" height="14px" delay={i * 0.1} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'insights':
        return (
          <div className="space-y-4">
            <div className="flex justify-between">
              <SkeletonBar width="100px" height="24px" />
              <SkeletonBar width="80px" height="16px" />
            </div>
            <div className="space-y-4">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <SkeletonCircle size="32px" delay={i * 0.1} />
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <SkeletonBar width="120px" height="16px" delay={i * 0.1} />
                        <SkeletonBar width="60px" height="16px" delay={i * 0.1} />
                      </div>
                      <SkeletonBar width="100%" height="14px" delay={i * 0.1} />
                      <SkeletonBar width="80%" height="14px" delay={i * 0.1} />
                      <div className="flex gap-2">
                        <SkeletonBar width="60px" height="24px" delay={i * 0.1} />
                        <SkeletonBar width="50px" height="24px" delay={i * 0.1} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'comparative':
        return (
          <div className="space-y-6">
            <div className="flex justify-between">
              <SkeletonBar width="150px" height="24px" />
              <SkeletonBar width="60px" height="16px" />
            </div>
            <div className="space-y-4">
              <SkeletonBar width="100px" height="20px" />
              <div className="bg-white border-base p-4 rounded-sm space-y-4">
                <div className="text-center space-y-2">
                  <SkeletonBar width="80px" height="24px" />
                  <SkeletonBar width="200px" height="16px" />
                </div>
                <SkeletonBar width="100%" height="120px" />
              </div>
            </div>
            <div className="space-y-4">
              <SkeletonBar width="150px" height="20px" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between">
                      <SkeletonBar width="80px" height="16px" delay={i * 0.1} />
                      <SkeletonBar width="60px" height="16px" delay={i * 0.1} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <SkeletonBar width="40px" height="14px" delay={i * 0.1} />
                        <SkeletonBar width="60px" height="14px" delay={i * 0.1} />
                      </div>
                      <div className="flex justify-between">
                        <SkeletonBar width="60px" height="14px" delay={i * 0.1} />
                        <SkeletonBar width="50px" height="14px" delay={i * 0.1} />
                      </div>
                    </div>
                    <SkeletonBar width="100%" height="8px" delay={i * 0.1} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return <SkeletonBar width="100%" height="200px" />;
    }
  };

  return (
    <div className={`animate-pulse ${className}`}>
      {renderSkeleton()}
    </div>
  );
};
