import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface AccordionItemData {
  id: string;
  title: string;
  content: string;
}

interface Accordion05Props {
  items: AccordionItemData[];
  align?: 'left' | 'right';
  accentRgb?: string;
}

export function Accordion05({ items, align = 'left', accentRgb }: Accordion05Props) {
  const [openValue, setOpenValue] = useState<string>("");
  const isRight = align === 'right';
  const borderColor = accentRgb ? `rgba(${accentRgb}, 0.15)` : 'rgba(255,255,255,0.1)';
  const idColor = accentRgb ? `rgba(${accentRgb}, 0.35)` : 'rgba(255,255,255,0.3)';

  return (
    <div className="w-full" onMouseLeave={() => setOpenValue("")}>
      <Accordion
        type="single"
        value={openValue}
        onValueChange={setOpenValue}
        collapsible
        className="w-full"
      >
        {items.map((item) => (
          <AccordionItem
            value={item.id}
            key={item.id}
            className="last:border-b"
            style={{ borderColor }}
            onMouseEnter={() => setOpenValue(item.id)}
          >
              <AccordionTrigger
              className={`${isRight ? 'text-right pr-4 md:pr-8' : 'text-left pl-4 md:pl-8'} text-white/70 duration-200 hover:no-underline cursor-pointer [&>svg]:hidden py-3 items-start`}
            >
              <div className={`flex flex-1 items-start gap-4 ${isRight ? 'flex-row-reverse' : ''}`}>
                <p className="text-[10px] font-mono mt-1 transition-colors duration-300" style={{ color: openValue === item.id && accentRgb ? `rgb(${accentRgb})` : idColor }}>{item.id}</p>
                <h4 
                  className={`uppercase relative ${isRight ? 'text-right' : 'text-left'} text-sm md:text-lg font-tech font-normal tracking-widest transition-all duration-300`}
                  style={{ 
                    color: openValue === item.id && accentRgb ? `rgb(${accentRgb})` : undefined,
                    textShadow: openValue === item.id && accentRgb ? `0 0 15px rgba(${accentRgb}, 0.5)` : undefined
                  }}
                >
                  {item.title}
                </h4>
              </div>
            </AccordionTrigger>

            <AccordionContent className={`text-gray-400/80 pb-4 ${isRight ? 'pr-4 md:pr-16 pl-4 text-right' : 'pl-4 md:pl-16 pr-4 text-left'} text-[11px] md:text-xs font-sans tracking-wide leading-relaxed normal-case`}>
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
