import React from 'react';

const HighlightText = ({ text = '', highlight = '' }) => {
    if (!highlight.trim()) {
        return <span>{text}</span>;
    }

    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <strong key={i} className="font-black text-slate-900 underline decoration-indigo-500/30 decoration-2 underline-offset-2">
                        {part}
                    </strong>
                ) : (
                    part
                )
            )}
        </span>
    );
};

export default HighlightText;
