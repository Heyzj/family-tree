import React from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

const SectionTitle: React.FC<SectionTitleProps> = ({ 
  title = "章节标题", 
  subtitle, 
  align = 'center' 
}) => {
  return (
    <div data-cmp="SectionTitle" className={`mb-16 ${align === 'center' ? 'text-center' : 'text-left'}`}>
      <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6 relative inline-block leading-tight">
        {title}
        <span className={`absolute -bottom-6 h-1 bg-primary ${align === 'center' ? 'left-1/2 -translate-x-1/2 w-16' : 'left-0 w-16'} transition-all duration-300 ease-in-out`}></span>
        <span className={`absolute -bottom-6 h-1 bg-primary/30 ${align === 'center' ? 'left-1/2 -translate-x-1/2 w-32' : 'left-0 w-32'} transition-all duration-300 ease-in-out`}></span>
      </h2>
      {subtitle && (
        <p className="text-muted-foreground mt-8 text-lg md:text-xl tracking-wider uppercase font-serif font-light leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;