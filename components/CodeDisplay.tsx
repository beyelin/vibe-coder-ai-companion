
import React, { useEffect } from 'react';

// Assuming Prism is loaded globally from CDN
declare const Prism: any;

interface CodeDisplayProps {
  code: string;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({ code }) => {
  useEffect(() => {
    if (typeof Prism !== 'undefined') {
      Prism.highlightAll();
    }
  }, [code]);

  return (
    <div className="h-full w-full bg-[#272822] rounded-lg overflow-auto">
      <pre className="h-full w-full !m-0 !p-0">
        <code className="language-jsx !p-4 block">
          {code}
        </code>
      </pre>
    </div>
  );
};
