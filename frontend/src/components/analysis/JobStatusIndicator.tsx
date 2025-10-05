import React from 'react';
import { motion } from 'framer-motion';
import { Loader, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface JobStatusIndicatorProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStage?: string;
}

const JobStatusIndicator: React.FC<JobStatusIndicatorProps> = ({ status, progress, currentStage }) => {
  // Variants for animation
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } as const }
  };

  // Progress circle variants
  const progressCircleVariants = {
    initial: { strokeDashoffset: 283 }, // 2π * 45 (circle radius)
    animate: { 
      strokeDashoffset: 283 - (283 * progress / 100),
      transition: { 
        duration: 1.2, 
        ease: "easeInOut" 
      } as const
    }
  };

  // Icon animation variants
  const iconVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.5, 
        delay: 0.2,
        type: "spring",
        stiffness: 200
      } as const
    }
  };

  // Text animation variants
  const textVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.4, 
        delay: 0.3
      } as const
    }
  };

  // Pulse animation for processing state
  const pulseVariants = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.05, 1],
      transition: { 
        repeat: Infinity, 
        duration: 2
      } as const
    }
  };

  // Determine colors and content based on status
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          color: 'text-yellow-500 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-300 dark:border-yellow-800',
          icon: <Clock className="h-8 w-8" />,
          title: 'Pending',
          description: 'Your job is in the queue'
        };
      case 'processing':
        return {
          color: 'text-blue-500 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          borderColor: 'border-blue-300 dark:border-blue-800',
          icon: <Loader className="h-8 w-8 animate-spin" />,
          title: 'Processing',
          description: currentStage || 'Your analysis is running'
        };
      case 'completed':
        return {
          color: 'text-green-500 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          borderColor: 'border-green-300 dark:border-green-800',
          icon: <CheckCircle className="h-8 w-8" />,
          title: 'Completed',
          description: 'Analysis completed successfully'
        };
      case 'failed':
        return {
          color: 'text-red-500 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          borderColor: 'border-red-300 dark:border-red-800',
          icon: <AlertCircle className="h-8 w-8" />,
          title: 'Failed',
          description: 'Something went wrong'
        };
      default:
        return {
          color: 'text-gray-500 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          borderColor: 'border-gray-300 dark:border-gray-700',
          icon: <Clock className="h-8 w-8" />,
          title: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={`rounded-xl p-6 border ${statusConfig.borderColor} ${statusConfig.bgColor} transition-colors duration-300`}
    >
      <div className="flex items-center">
        {/* Progress Circle for Processing Status */}
        <div className="relative mr-5">
          <motion.div
            variants={status === 'processing' ? pulseVariants : {}}
            initial="initial"
            animate="animate"
            className={`rounded-full h-14 w-14 flex items-center justify-center ${statusConfig.bgColor}`}
          >
            <svg className="absolute inset-0" width="56" height="56" viewBox="0 0 56 56">
              {/* Background Circle */}
              <circle
                cx="28"
                cy="28"
                r="26"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.2"
                strokeWidth="3"
                className={statusConfig.color}
              />
              
              {/* Progress Circle */}
              {(status === 'pending' || status === 'processing') && (
                <motion.circle
                  cx="28"
                  cy="28"
                  r="26"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="283"
                  strokeDashoffset="283"
                  strokeLinecap="round"
                  transform="rotate(-90 28 28)"
                  className={statusConfig.color}
                  variants={progressCircleVariants}
                  initial="initial"
                  animate="animate"
                />
              )}
            </svg>
            
            <motion.div
              variants={iconVariants}
              initial="initial"
              animate="animate"
              className={statusConfig.color}
            >
              {statusConfig.icon}
            </motion.div>
          </motion.div>
        </div>
        
        <div>
          <motion.h3
            variants={textVariants}
            initial="initial"
            animate="animate"
            className="font-semibold text-lg text-gray-900 dark:text-white mb-1"
          >
            {statusConfig.title}
            {status === 'processing' && (
              <span className="ml-2 text-sm font-normal">
                {progress}%
              </span>
            )}
          </motion.h3>
          
          <motion.p
            variants={textVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-600 dark:text-gray-300"
          >
            {statusConfig.description}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default JobStatusIndicator;
