import { Leaf } from 'lucide-react';

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <div className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center animate-spin shadow-sm border-2 border-white">
        <Leaf className="w-6 h-6 text-white" />
      </div>
      <p className="text-gray-500 text-sm font-medium">{message}</p>
    </div>
  );
};

export default Loading;