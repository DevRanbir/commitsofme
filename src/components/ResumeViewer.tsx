"use client";

import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ZoomIn, ZoomOut, Download, ExternalLink, Loader2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Configure worker to use the same version as installed
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ResumeViewerProps {
    url: string;
}

export function ResumeViewer({ url }: ResumeViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [scale, setScale] = useState<number>(1.0);
    const [containerWidth, setContainerWidth] = useState<number>(800);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setIsLoading(false);
    }

    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    const getDownloadUrl = (link: string) => {
        const idMatch = link.match(/\/d\/(.*?)\//);
        if (idMatch && idMatch[1]) {
            return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
        }
        return link;
    };

    const downloadUrl = getDownloadUrl(url);
    const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(downloadUrl)}`;

    // Fit width logic and constraints
    const baseWidth = Math.min(containerWidth, 900);
    const maxWidth = typeof window !== 'undefined' ? window.innerWidth * 0.9 : 2000;
    const pdfWidth = Math.min(baseWidth * scale, maxWidth);

    return (
        <div
            className="w-full relative flex flex-col items-center group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Main Viewer Area */}
            <div
                ref={containerRef}
                className="w-full relative min-h-[600px] flex justify-center perspective-1000"
            >
                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center z-10"
                        >
                            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <Document
                    file={proxyUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={null}
                    error={
                        <div className="flex flex-col items-center justify-center text-muted-foreground p-8 text-center gap-2">
                            <p>Unable to load preview.</p>
                            <a href={url} target="_blank" className="text-primary underline underline-offset-4 text-sm hover:text-primary/80">Open External</a>
                        </div>
                    }
                    className="flex flex-col gap-8 items-center w-full"
                >
                    {Array.from(new Array(numPages), (el, index) => (
                        <motion.div
                            key={`page_${index + 1}`}
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
                            className="relative overflow-hidden rounded-sm shadow-2xl ring-1 ring-black/5"
                        >
                            <Page
                                pageNumber={index + 1}
                                width={pdfWidth}
                                renderAnnotationLayer={true}
                                renderTextLayer={true}
                                className="bg-white !mb-0"
                                loading={null}
                            />
                        </motion.div>
                    ))}
                </Document>
            </div>

            {/* Tab Toolbar (Outside Top) */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
                className="absolute top-0 right-6 md:right-12 z-40 -translate-y-full bg-background/90 backdrop-blur-xl border-t border-x border-b-0 border-white/10 px-4 py-2 rounded-t-xl shadow-xl flex items-center gap-3 origin-bottom"
            >
                <div className="flex items-center gap-1 border-r border-border/50 pr-2 md:pr-4">
                    <button
                        onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                        className="p-2 hover:bg-primary/10 hover:text-primary rounded-full transition-colors text-muted-foreground"
                    >
                        <ZoomOut size={18} strokeWidth={1.5} />
                    </button>
                    <span className="text-xs font-mono w-[3ch] text-center select-none text-foreground">{Math.round(scale * 100)}%</span>
                    <button
                        onClick={() => setScale(s => Math.min(1.5, s + 0.1))}
                        className="p-2 hover:bg-primary/10 hover:text-primary rounded-full transition-colors text-muted-foreground"
                    >
                        <ZoomIn size={18} strokeWidth={1.5} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <a
                        href={downloadUrl}
                        download="Resume.pdf"
                        target="_blank"
                        className="p-2 hover:bg-primary/10 hover:text-primary rounded-full transition-colors text-muted-foreground"
                        title="Download"
                    >
                        <Download size={18} strokeWidth={1.5} />
                    </a>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-primary/10 hover:text-primary rounded-full transition-colors text-muted-foreground"
                        title="Open Original"
                    >
                        <Maximize2 size={18} strokeWidth={1.5} />
                    </a>
                </div>
            </motion.div>
        </div>
    );
}
