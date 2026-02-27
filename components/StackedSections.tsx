import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Section from './Section';
import { SectionData } from '../types';

gsap.registerPlugin(ScrollTrigger);

interface StackedSectionsProps {
    sections: SectionData[];
    lang: 'EN' | 'PT';
    onExpandChange: (isExpanded: boolean) => void;
}

const StackedSections: React.FC<StackedSectionsProps> = ({ sections, lang, onExpandChange }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const panelsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const panels = panelsRef.current.filter(Boolean) as HTMLDivElement[];

            panels.forEach((panel, i) => {
                // Ensure clean transform defaults on every panel
                gsap.set(panel, {
                    transformOrigin: 'center center',
                    rotation: 0,
                    rotationX: 0,
                    rotationY: 0,
                });

                if (i < panels.length - 1) {
                    // Pin each section in place while the next one scrolls over
                    ScrollTrigger.create({
                        trigger: panel,
                        start: 'top top',
                        pin: true,
                        pinSpacing: false,
                    });

                    // Smooth recede effect on the pinned section:
                    // - Subtle scale-down (0.96) for gentle depth
                    // - Mild opacity reduction (0.88)
                    // - Longer scroll range + higher scrub for buttery smoothness
                    // - Explicit rotation: 0 to prevent any rotation artifacts
                    gsap.to(panel, {
                        scale: 0.96,
                        opacity: 0.88,
                        rotation: 0,
                        borderRadius: '16px',
                        ease: 'none',
                        scrollTrigger: {
                            trigger: panels[i + 1],
                            start: 'top 90%',
                            end: 'top 5%',
                            scrub: 1.5,
                        },
                    });

                    // Soft shadow on the incoming section for depth
                    gsap.fromTo(
                        panels[i + 1],
                        { boxShadow: '0 -20px 60px rgba(0,0,0,0)' },
                        {
                            boxShadow: '0 -20px 60px rgba(0,0,0,0.12)',
                            ease: 'none',
                            scrollTrigger: {
                                trigger: panels[i + 1],
                                start: 'top 90%',
                                end: 'top 5%',
                                scrub: 1.5,
                            },
                        }
                    );
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, [sections.length]);

    return (
        <div ref={containerRef} className="stacked-sections-container relative">
            {sections.map((section, index) => (
                <div
                    key={section.id}
                    ref={(el) => { panelsRef.current[index] = el; }}
                    className="stacked-panel"
                    style={{
                        position: 'relative',
                        zIndex: index + 1,
                        willChange: 'transform, opacity, border-radius',
                        overflow: 'hidden',
                        backfaceVisibility: 'hidden' as const,
                    }}
                >
                    <Section
                        data={section}
                        index={index}
                        lang={lang}
                        onExpandChange={onExpandChange}
                    />
                </div>
            ))}
        </div>
    );
};

export default StackedSections;
