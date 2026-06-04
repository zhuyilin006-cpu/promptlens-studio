import React from 'react';

interface StoryboardItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  tags: string[];
  price: string;
}

interface FilmGridStoryboardProps {
  data: StoryboardItem[];
  onExecuteAction?: () => void;
}

export default function FilmGridStoryboard({ data, onExecuteAction }: FilmGridStoryboardProps) {
  return (
    <div className="w-full p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => (
          <div 
            key={item.id}
            className="group bg-white border border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden"
          >
            {/* Image Container */}
            <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm font-mono">NO IMAGE</span>
                </div>
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-2">
              <div className="text-[9px] font-mono text-gray-400 tracking-widest uppercase">
                {item.subtitle}
              </div>
              <h3 className="font-serif italic text-lg text-[#111111] group-hover:text-gray-700 transition-colors">
                {item.title}
              </h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                {item.description}
              </p>
              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-2">
                {item.tags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="text-[8px] font-mono text-gray-400 border border-gray-200 px-1.5 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {/* Price & Action */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
                <span className="font-serif italic text-sm">{item.price}</span>
                <button 
                  onClick={onExecuteAction}
                  className="text-[9px] font-mono bg-[#111111] text-white px-3 py-1.5 hover:bg-gray-800 transition-colors tracking-wider"
                >
                  EXECUTE
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}