import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 bg-gradient-to-r from-primary to-blue-500 rounded-full flex items-center justify-center"
      >
        <Leaf className="w-6 h-6 text-white" />
      </motion.div>
      <p className="text-gray-500 text-sm font-medium">{message}</p>
    </div>
  );
};

export default Loading;