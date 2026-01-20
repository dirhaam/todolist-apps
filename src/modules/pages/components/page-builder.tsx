"use client";

import { useState } from "react";
import { Type, Image as ImageIcon, Box, Video, Map, Minus, GripHorizontal, Timer, ClipboardList, Images, Star, List, Grid, Layout, MessageCircle, Save, Trash2, Plus, UploadCloud, ArrowUp, ArrowDown, Laptop, Tablet, Smartphone, X, ChevronDown, ChevronRight, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { updatePageContentAction } from "../actions/page.actions";
import type { Page, PageSlide, PageElement, ElementType } from "../schemas/page.schema";

interface PageBuilderProps {
    page: Page;
}

export default function PageBuilder({ page }: PageBuilderProps) {
    // State: Slides (with safety check for old data)
    const initialContent = Array.isArray(page.content) ? page.content : [];
    const safeSlides = initialContent.map((s: any) => ({
        ...s,
        id: s.id || crypto.randomUUID(),
        name: s.name || "Untitled Slide",
        elements: Array.isArray(s.elements) ? s.elements : [],
        background: s.background || "#ffffff"
    })) as PageSlide[];

    // ...
    const [slides, setSlides] = useState<PageSlide[]>(safeSlides);
    const [currentSlideId, setCurrentSlideId] = useState<string | null>(slides.length > 0 ? slides[0].id : null);

    // State: Selection
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

    // State: UI
    const [isSaving, setIsSaving] = useState(false);
    const [isPublished, setIsPublished] = useState(page.isPublished);
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [customFonts, setCustomFonts] = useState<{ name: string, url: string }[]>(page.fonts || []);

    // Derived
    const currentSlide = slides.find(s => s.id === currentSlideId) || null;
    
    // Helper: Find element recursively at any nesting level
    const findElementById = (elements: PageElement[], id: string): PageElement | null => {
        for (const el of elements) {
            if (el.id === id) return el;
            if (el.elements) {
                const found = findElementById(el.elements, id);
                if (found) return found;
            }
        }
        return null;
    };
    
    const selectedElement = currentSlide && selectedElementId 
        ? findElementById(currentSlide.elements, selectedElementId)
        : null;

    // --- ACTIONS: SLIDES ---

    const addSlide = () => {
        const newSlide: PageSlide = {
            id: crypto.randomUUID(),
            name: `Slide ${slides.length + 1}`,
            elements: [],
            background: "#ffffff"
        };
        setSlides([...slides, newSlide]);
        setCurrentSlideId(newSlide.id);
        setSelectedElementId(null);
    };

    const deleteSlide = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const newSlides = slides.filter(s => s.id !== id);
        setSlides(newSlides);
        if (currentSlideId === id) {
            setCurrentSlideId(newSlides.length > 0 ? newSlides[0].id : null);
        }
    };

    const updateSlideProp = (id: string, prop: keyof PageSlide, value: any) => {
        setSlides(slides.map(s => s.id === id ? { ...s, [prop]: value } : s));
    };

    // --- ACTIONS: ELEMENTS ---

    const addElement = (type: ElementType) => {
        if (!currentSlide) return;

        const newElement: PageElement = {
            id: crypto.randomUUID(),
            type,
            props: getDefaultProps(type),
        };

        const updatedSlide = {
            ...currentSlide,
            elements: [...currentSlide.elements, newElement]
        };

        setSlides(slides.map(s => s.id === currentSlide.id ? updatedSlide : s));
        setSelectedElementId(newElement.id);
    };

    const updateElementProps = (elementId: string, props: Record<string, any>) => {
        if (!currentSlide) return;
        
        const updateElementRecursively = (elements: PageElement[]): PageElement[] => {
            return elements.map(e => {
                if (e.id === elementId) {
                    return { ...e, props: { ...e.props, ...props } };
                }
                if (e.elements) {
                    return { ...e, elements: updateElementRecursively(e.elements) };
                }
                return e;
            });
        };

        setSlides(slides.map(s =>
            s.id === currentSlide.id ? { ...currentSlide, elements: updateElementRecursively(currentSlide.elements) } : s
        ));
    };

    const deleteElement = (elementId: string) => {
        if (!currentSlide) return;
        
        const deleteElementRecursively = (elements: PageElement[]): PageElement[] => {
            return elements
                .filter(e => e.id !== elementId)
                .map(e => ({
                    ...e,
                    elements: e.elements ? deleteElementRecursively(e.elements) : undefined
                }));
        };

        setSlides(slides.map(s =>
            s.id === currentSlide.id ? { ...currentSlide, elements: deleteElementRecursively(currentSlide.elements) } : s
        ));
        setSelectedElementId(null);
    };

    const moveElement = (elementId: string, direction: 'up' | 'down') => {
        if (!currentSlide) return;

        const moveRecursively = (elements: PageElement[]): { found: boolean, newElements: PageElement[] } => {
             const index = elements.findIndex(e => e.id === elementId);
             
             // Base case: Found in current level
             if (index !== -1) {
                 if (direction === 'up' && index === 0) return { found: true, newElements: elements }; // Can't move up
                 if (direction === 'down' && index === elements.length - 1) return { found: true, newElements: elements }; // Can't move down

                 const newArr = [...elements];
                 const swapIndex = direction === 'up' ? index - 1 : index + 1;
                 [newArr[index], newArr[swapIndex]] = [newArr[swapIndex], newArr[index]];
                 return { found: true, newElements: newArr };
             }

             // Recursive step: Search in children
             let foundInChild = false;
             const newElements = elements.map(el => {
                 if (el.elements && el.elements.length > 0) {
                     const result = moveRecursively(el.elements);
                     if (result.found) {
                         foundInChild = true;
                         return { ...el, elements: result.newElements };
                     }
                 }
                 return el;
             });

             return { found: foundInChild, newElements };
        };

        const result = moveRecursively(currentSlide.elements);
        if (result.found) {
             setSlides(slides.map(s =>
                s.id === currentSlide.id ? { ...currentSlide, elements: result.newElements } : s
            ));
        }
    };

    const handleUploadFont = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const file = files[0];

        const fontName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, ''); // Simple cleanup

        const toastId = toast.loading("Uploading font...");
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", { method: "POST", body: formData });
            if (!response.ok) throw new Error("Upload failed");
            const data = await response.json() as { url: string };

            const newFont = { name: fontName, url: data.url };
            setCustomFonts(prev => [...prev, newFont]);

            // Auto-select the new font if an element is selected
            if (selectedElementId) {
                updateElementProps(selectedElementId, { fontFamily: fontName });
            }

            toast.success(`Font '${fontName}' added!`, { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Font upload failed", { id: toastId });
        }
    };

    const savePage = async () => {
        setIsSaving(true);
        try {
            console.log('DEBUG: Saving slides:', JSON.stringify(slides, null, 2));
            await updatePageContentAction(page.id, slides, isPublished, customFonts);
            toast.success("Page saved successfully!");
        } catch (error) {
            toast.error("Failed to save page.");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)]">
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Dancing+Script:wght@400..700&family=Great+Vibes&family=Inter:wght@100..900&family=Lato:wght@100..900&family=Merriweather:wght@300;400;700&family=Montserrat:wght@100..900&family=Open+Sans:wght@300..800&family=Playfair+Display:wght@400..900&family=Roboto:wght@100..900&display=swap');
                ${customFonts.map(f => `
                @font-face {
                    font-family: '${f.name}';
                    src: url('${f.url}');
                }
            `).join('\n')}
            `}} />

            {/* LEFT SIDEBAR: Structure & Layers */}
            <div className="w-full lg:w-72 flex flex-col gap-0 bg-white border-r -ml-4 h-full overflow-hidden">
                {/* TOOLBAR HEADER */}
                <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                    <span className="font-bold text-sm">Editor</span>
                    <Button size="sm" onClick={savePage} disabled={isSaving}>
                        <Save className="w-3 h-3 mr-1" /> Save
                    </Button>
                </div>

                {/* SLIDE LIST */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* ... */}
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-gray-500 uppercase">Slides</Label>
                        <Button variant="ghost" size="sm" onClick={addSlide}><Plus className="w-3 h-3" /></Button>
                    </div>

                    <div className="space-y-2">
                        {slides.map((slide, index) => (
                            <div
                                key={slide.id}
                                onClick={() => { setCurrentSlideId(slide.id); setSelectedElementId(null); }}
                                className={`p-3 rounded border text-sm cursor-pointer flex items-center justify-between group ${currentSlideId === slide.id ? 'border-purple-500 bg-purple-50' : 'hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="bg-gray-200 text-gray-600 w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold">{index + 1}</span>
                                    <span className="truncate max-w-[100px]">{slide.name}</span>
                                </div>
                                <Trash2
                                    className="w-3 h-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                                    onClick={(e) => deleteSlide(slide.id, e)}
                                />
                            </div>
                        ))}
                        {slides.length === 0 && (
                            <div className="text-center py-4">
                                <Button size="sm" onClick={addSlide}>Add First Slide</Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ELEMENT LAYERS (Visible for Current Slide) */}
                {currentSlide && (
                    <div className="h-1/2 border-t flex flex-col">
                        <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                            <Label className="text-xs font-bold text-gray-500 uppercase">Layers</Label>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {currentSlide.elements.map((el) => (
                                <ElementLayer 
                                    key={el.id} 
                                    element={el} 
                                    selectedElementId={selectedElementId}
                                    onSelect={setSelectedElementId}
                                    level={0}
                                />
                            ))}
                            {currentSlide.elements.length === 0 && (
                                <p className="text-xs text-center text-gray-400 py-4">No elements in this slide</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* CENTER CANVAS */}
            <div className="flex-1 bg-gray-100/50 flex flex-col h-full overflow-hidden rounded-xl border relative">
                {/* Canvas Toolbar */}
                <div className="bg-white border-b p-2 flex flex-col gap-2 shrink-0">
                    <div className="flex gap-1 overflow-x-auto pb-2 noscrollbar">
                        <div className="flex items-center gap-1 border-r pr-2 mr-2">
                            <Button variant="ghost" size="sm" onClick={() => addElement('text')} disabled={!currentSlide} title="Text">
                                <Type className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => addElement('image')} disabled={!currentSlide} title="Image">
                                <ImageIcon className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => addElement('button')} disabled={!currentSlide} title="Button">
                                <Box className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => addElement('video')} disabled={!currentSlide} title="Video (YouTube)">
                                <Video className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => addElement('map')} disabled={!currentSlide} title="Map">
                                <Map className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => addElement('divider')} disabled={!currentSlide} title="Divider">
                                <Minus className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => addElement('spacer')} disabled={!currentSlide} title="Spacer">
                                <GripHorizontal className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-1 border-l pl-2">
                            <Button variant="ghost" size="sm" onClick={() => addElement('countdown')} disabled={!currentSlide} title="Countdown">
                                <Timer className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => addElement('rsvp')} disabled={!currentSlide} title="RSVP">
                                <ClipboardList className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => addElement('guestbook')} disabled={!currentSlide} title="Guestbook/Comments">
                                <MessageCircle className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => addElement('gallery')} disabled={!currentSlide} title="Gallery">
                                <Images className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => addElement('container')} disabled={!currentSlide} title="Container/Block">
                                <Box className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-center bg-gray-500/5 rounded p-0.5 gap-1 self-center">
                        <button onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded transition-colors ${previewDevice === 'desktop' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}><Laptop className="w-3 h-3" /></button>
                        <button onClick={() => setPreviewDevice('tablet')} className={`p-1.5 rounded transition-colors ${previewDevice === 'tablet' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}><Tablet className="w-3 h-3" /></button>
                        <button onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded transition-colors ${previewDevice === 'mobile' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}><Smartphone className="w-3 h-3" /></button>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-gray-200" onClick={() => setSelectedElementId(null)}>
                    {currentSlide ? (
                        <div
                            className={`bg-white shadow-xl transition-all duration-300 relative ${previewDevice === 'mobile' ? 'w-[375px] min-h-[667px] rounded-[2rem] border-8 border-gray-800' :
                                previewDevice === 'tablet' ? 'w-[768px] min-h-[1024px]' :
                                    'w-full max-w-5xl min-h-[600px] aspect-video' // Desktop acts like a slide
                                }`}
                            style={{ backgroundColor: currentSlide.background }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Mobile Notch */}
                            {previewDevice === 'mobile' && <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-gray-800 rounded-b-xl z-50"></div>}

                            {/* Elements Render */}
                            <div className="p-8 flex flex-col gap-4">
                                {currentSlide.elements.map(element => (
                                    <div
                                        key={element.id}
                                        onClick={(e) => { e.stopPropagation(); setSelectedElementId(element.id); }}
                                        className={`relative group ${selectedElementId === element.id ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-1 hover:ring-blue-300'}`}
                                    >
                                        <ElementRenderer element={element} />

                                        {selectedElementId === element.id && (
                                            <div className="absolute top-0 right-0 -translate-y-full -mt-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-t font-medium flex gap-1 z-20">
                                                <span className="cursor-pointer hover:bg-white/20 px-1 rounded" onClick={() => moveElement(element.id, 'up')}>↑</span>
                                                <span className="cursor-pointer hover:bg-white/20 px-1 rounded" onClick={() => moveElement(element.id, 'down')}>↓</span>
                                                <span className="cursor-pointer hover:bg-red-500 px-1 rounded" onClick={() => deleteElement(element.id)}>×</span>
                                                <span className="opacity-50 ml-1 uppercase">{element.type}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center text-gray-400">Select or Add a Slide</div>
                    )}
                </div>
            </div>

            {/* RIGHT SIDEBAR: Properties */}
            <div className="w-full lg:w-72 bg-white border-l -mr-4 p-4 overflow-y-auto">
                <div className="mb-6">
                    <Label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Settings</Label>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <Label htmlFor="pub" className="text-sm">Publish</Label>
                        <input id="pub" type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="accent-purple-600" />
                    </div>
                </div>

                {selectedElement ? (
                    <div className="space-y-4">
                        <div className="pb-2 border-b mb-2 flex justify-between items-center">
                            <Label className="text-xs font-bold text-blue-500 uppercase">Edit {selectedElement.type}</Label>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-500 hover:text-blue-500 hover:bg-blue-50" onClick={() => moveElement(selectedElement.id, 'up')} title="Move Up">
                                    <ArrowUp className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-500 hover:text-blue-500 hover:bg-blue-50" onClick={() => moveElement(selectedElement.id, 'down')} title="Move Down">
                                    <ArrowDown className="w-3.5 h-3.5" />
                                </Button>
                                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteElement(selectedElement.id)} title="Delete Element">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                        <ElementEditor
                            element={selectedElement}
                            onChange={props => updateElementProps(selectedElement.id, props)}
                            onAddChildElement={(newElement) => {
                                // Add child to container's elements array
                                if (!currentSlide) return;
                                const addChildRecursively = (elements: PageElement[]): PageElement[] => {
                                    return elements.map(el => {
                                        if (el.id === selectedElement.id) {
                                            return { ...el, elements: [...(el.elements || []), newElement] };
                                        }
                                        if (el.elements) {
                                            return { ...el, elements: addChildRecursively(el.elements) };
                                        }
                                        return el;
                                    });
                                };
                                setSlides(slides.map(s =>
                                    s.id === currentSlide.id ? { ...currentSlide, elements: addChildRecursively(currentSlide.elements) } : s
                                ));
                            }}
                            customFonts={customFonts}
                            onUploadFont={handleUploadFont}
                        />
                    </div>
                ) : currentSlide ? (
                    <div className="space-y-4">
                        <div className="pb-2 border-b mb-2">
                            <Label className="text-xs font-bold text-gray-500 uppercase">Slide Options</Label>
                        </div>
                        <div className="space-y-2">
                            <Label>Slide Name</Label>
                            <Input value={currentSlide.name} onChange={e => updateSlideProp(currentSlide.id, 'name', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Background Color</Label>
                            <div className="flex gap-2">
                                <Input type="color" className="w-10 p-1" value={currentSlide.background} onChange={e => updateSlideProp(currentSlide.id, 'background', e.target.value)} />
                                <Input value={currentSlide.background} onChange={e => updateSlideProp(currentSlide.id, 'background', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Slide Transition</Label>
                            <select 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={currentSlide.transition || 'none'}
                                onChange={e => updateSlideProp(currentSlide.id, 'transition', e.target.value)}
                            >
                                <option value="none">None</option>
                                <option value="fade">Fade</option>
                                <option value="slide-left">Slide Left</option>
                                <option value="slide-right">Slide Right</option>
                                <option value="zoom">Zoom</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Transition Duration</Label>
                            <select 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={currentSlide.transitionDuration || '0.8s'}
                                onChange={e => updateSlideProp(currentSlide.id, 'transitionDuration', e.target.value)}
                            >
                                <option value="0.3s">0.3s (Cepat)</option>
                                <option value="0.5s">0.5s</option>
                                <option value="0.8s">0.8s (Default)</option>
                                <option value="1s">1s</option>
                                <option value="1.5s">1.5s</option>
                                <option value="2s">2s (Lambat)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Custom Script (JavaScript)</Label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="console.log('Slide loaded');"
                                value={currentSlide.script || ''}
                                onChange={e => updateSlideProp(currentSlide.id, 'script', e.target.value)}
                            />
                            <p className="text-xs text-gray-500">Script akan dijalankan saat slide di-load</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 text-center">Select an item to edit</p>
                )}
            </div>
        </div >
    );
}

// --- UTILS & COMPONENTS ---

function getIconForType(type: ElementType) {
    switch (type) {
        case 'text': return <Type className="w-3 h-3" />;
        case 'image': return <ImageIcon className="w-3 h-3" />;
        case 'button': return <Box className="w-3 h-3" />;
        case 'video': return <Video className="w-3 h-3" />;
        case 'map': return <Map className="w-3 h-3" />;
        case 'divider': return <Minus className="w-3 h-3" />;
        case 'spacer': return <GripHorizontal className="w-3 h-3" />;
        case 'countdown': return <Timer className="w-3 h-3" />;
        case 'rsvp': return <ClipboardList className="w-3 h-3" />;
        case 'guestbook': return <MessageCircle className="w-3 h-3" />;
        case 'gallery': return <Images className="w-3 h-3" />;
        case 'container': return <Box className="w-3 h-3" />;
        default: return <LayoutTemplate className="w-3 h-3" />;
    }
}

function getDefaultProps(type: ElementType) {
    switch (type) {
        case 'text': return { content: "Add your text here", align: 'left', fontSize: '16px', color: '#000000', fontWeight: 'normal' };
        case 'image': return { src: "https://placehold.co/600x400", alt: "Image", width: '100%', align: 'center' };
        case 'button': return { text: "Click Me", link: "#", variant: 'default', align: 'center' };
        case 'video': return { url: "https://www.youtube.com/embed/dQw4w9WgXcQ", height: "300px" };
        case 'map': return { keyword: "Monas, Jakarta", height: "300px" };
        case 'divider': return { color: "#e5e7eb", width: "100%", style: "solid", thickness: "1px" };
        case 'spacer': return { height: "50px" };
        case 'countdown': return { targetDate: "2025-12-31T23:59", color: "#000000", bgColor: "#f3f4f6" };
        case 'rsvp':
            return { title: 'RSVP', description: 'Please let us know if you will attend' };
        case 'guestbook':
            return { title: 'Guestbook', description: 'Leave a message for us!' };
        case 'gallery':
            return { images: "https://placehold.co/400x400\nhttps://placehold.co/400x400\nhttps://placehold.co/400x400" };
        case 'container': return { layout: 'horizontal', gap: '16px', width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', flexWrap: 'nowrap' };
        default: return {};
    }
}

function ElementRenderer({ element }: { element: PageElement }) {
    const commonStyle: any = {
        textAlign: element.props.align,
        paddingTop: element.props.paddingY,
        paddingBottom: element.props.paddingY,
        paddingLeft: element.props.paddingX,
        paddingRight: element.props.paddingX,
        marginTop: element.props.marginTop,
        marginBottom: element.props.marginBottom,
        backgroundColor: element.props.backgroundColor,
        borderRadius: element.props.borderRadius,
        fontFamily: element.props.fontFamily,
    };

    // Helper to merge styles for specific elements if needed, 
    // but mostly we wrap everything in a div that applies these styles.

    const content = () => {
        switch (element.type) {
            case 'text':
                return (
                    <p style={{
                        fontSize: element.props.fontSize,
                        color: element.props.color,
                        fontWeight: element.props.fontWeight
                    }}>
                        {element.props.content}
                    </p>
                );
            case 'image':
                return (
                    <div className="flex" style={{ justifyContent: element.props.align === 'center' ? 'center' : element.props.align === 'right' ? 'flex-end' : 'flex-start' }}>
                        <img src={element.props.src} alt={element.props.alt} style={{ width: element.props.width, maxWidth: '100%', borderRadius: '8px' }} />
                    </div>
                );
            case 'button':
                return (
                    <div className="flex" style={{ justifyContent: element.props.align === 'center' ? 'center' : element.props.align === 'right' ? 'flex-end' : 'flex-start' }}>
                        <Button asChild className="pointer-events-none" variant={element.props.variant as any}>
                            <a href={element.props.link}>{element.props.text}</a>
                        </Button>
                    </div>
                );
            case 'video':
                return (
                    <div className="w-full flex justify-center">
                        <iframe
                            src={element.props.url}
                            style={{ width: '100%', height: element.props.height, borderRadius: '8px' }}
                            allowFullScreen
                            className="bg-black"
                        />
                    </div>
                );
            case 'map':
                const mapQuery = encodeURIComponent(element.props.keyword);
                return (
                    <div className="w-full">
                        <div className="w-full bg-gray-100 rounded flex items-center justify-center text-gray-500 text-sm p-4 border block" style={{ height: element.props.height }}>
                            <p>Map View (Placeholder)</p>
                        </div>
                    </div>
                );
            case 'divider':
                return (
                    <div className="w-full flex justify-center py-2">
                        <hr style={{
                            borderColor: element.props.color,
                            width: element.props.width,
                            borderTopStyle: element.props.style,
                            borderTopWidth: element.props.thickness
                        }} />
                    </div>
                );
            case 'spacer':
                return <div style={{ height: element.props.height, width: '100%' }} className="bg-transparent border border-dashed border-gray-300/50 min-h-[10px]" />;
            case 'countdown':
                return (
                    <div className="p-4 rounded-xl text-center" style={{ backgroundColor: element.props.bgColor, color: element.props.color }}>
                        <p className="text-xs uppercase tracking-widest mb-2">Countdown to</p>
                        <p className="text-xl font-bold">{new Date(element.props.targetDate).toLocaleDateString('en-GB')}</p>
                        <div className="grid grid-cols-4 gap-2 mt-4 text-sm font-mono">
                            <div className="bg-white/20 rounded p-1">00<div className="text-[8px]">DAYS</div></div>
                            <div className="bg-white/20 rounded p-1">00<div className="text-[8px]">HRS</div></div>
                            <div className="bg-white/20 rounded p-1">00<div className="text-[8px]">MIN</div></div>
                            <div className="bg-white/20 rounded p-1">00<div className="text-[8px]">SEC</div></div>
                        </div>
                    </div>
                );
            case 'rsvp':
                return (
                    <div className="p-6 bg-white rounded-xl shadow-sm border text-center">
                        <h3 className="font-bold text-lg mb-2">{element.props.title}</h3>
                        <p className="text-sm text-gray-500 mb-4">{element.props.description}</p>
                        <div className="space-y-3 opacity-50">
                            <Input placeholder="Your Name" disabled />
                            <select className="w-full border rounded p-2 text-sm" disabled><option>Will Attend</option></select>
                            <Button className="w-full" disabled>Send RSVP</Button>
                        </div>
                    </div>
                );
            case 'gallery':
                const images = (element.props.images || "").split('\n').filter((url: string) => url.trim() !== "");
                return (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                        {images.map((url: string, i: number) => (
                            <div key={i} className="aspect-square bg-gray-100 rounded overflow-hidden">
                                <img src={url} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                            </div>
                        ))}
                        {images.length === 0 && <div className="col-span-3 text-center text-xs text-gray-400 py-4">No images added</div>}
                    </div>
                );
            case 'container':
                const containerLayoutStyle: React.CSSProperties = element.props.layout === 'grid'
                    ? {
                        display: 'grid',
                        gridTemplateColumns: `repeat(${element.props.columns || 2}, 1fr)`,
                        gap: element.props.gap || '16px'
                    }
                    : {
                        display: 'flex',
                        flexDirection: (element.props.layout === 'vertical' ? 'column' : 'row') as 'row' | 'column',
                        gap: element.props.gap || '16px',
                        justifyContent: element.props.justifyContent || element.props.justify || 'flex-start',
                        alignItems: element.props.alignItems || element.props.align || 'flex-start',
                        flexWrap: (element.props.flexWrap || (element.props.wrap ? 'wrap' : 'nowrap')) as 'wrap' | 'nowrap'
                    };

                return (
                    <div 
                        className="border-2 border-dashed border-blue-300 p-4 rounded min-h-[100px] bg-blue-50/30"
                        style={{ ...containerLayoutStyle, width: element.props.width || '100%' }}
                    >
                        {element.elements && element.elements.length > 0 ? (
                            element.elements.map(child => (
                                <div key={child.id} className={`border ${element.props.layout === 'grid' ? 'border-dashed border-gray-300' : 'border-gray-200'} p-2 rounded bg-white h-full`}>
                                    <ElementRenderer element={child} />
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-sm text-center py-4">Empty Container - Add elements using button below</p>
                        )}
                    </div>
                );
            default:
                return <div>Unknown</div>;
        }
    }

    return (
        <div style={{
            ...commonStyle,
            // Sizing override (removed w-full class)
            width: element.props.width || '100%',
            height: element.props.height || 'auto',
            // Background properties should be on this outer wrapper
            backgroundImage: element.props.backgroundImage ? `url(${element.props.backgroundImage})` : undefined,
            backgroundSize: element.props.backgroundSize,
            backgroundPosition: element.props.backgroundPosition,
            backgroundRepeat: element.props.backgroundRepeat,
        }} className="relative overflow-hidden group">
            {/* Background Overlay */}
            {element.props.overlayColor && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundColor: element.props.overlayColor }}
                />
            )}

            {/* Content Wrapper - Relative to sit on top of overlay */}
            <div className="relative z-10 h-full">
                {content()}
            </div>
        </div>
    );
}

// --- SIZE CONTROL ---
function SizeControl({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
    // Parse value into number and unit
    const parseValue = (val: string) => {
        if (!val || val === 'auto') return { num: '', unit: 'auto' };
        const match = val.match(/^(\d+)(.*)$/);
        if (match) return { num: match[1], unit: match[2] || 'px' };
        return { num: '', unit: 'px' }; // Fallback
    };

    const { num, unit } = parseValue(value);

    const handleNumChange = (newNum: string) => {
        if (unit === 'auto') onChange(`${newNum}px`); // Switch to px if typing number
        else onChange(`${newNum}${unit}`);
    };

    const handleUnitChange = (newUnit: string) => {
        if (newUnit === 'auto') onChange('auto');
        else onChange(`${num || '100'}${newUnit}`);
    };

    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center">
                <Label className="text-[10px]">{label}</Label>
                <div className="flex gap-1">
                    {['px', '%', 'vh', 'auto'].map(u => (
                        <button 
                            key={u}
                            onClick={() => handleUnitChange(u)}
                            className={`text-[8px] px-1 rounded uppercase ${unit === u ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {u}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex gap-1">
                <Input 
                    type="number" 
                    className="h-8 text-xs" 
                    placeholder={unit === 'auto' ? 'Auto' : '0'} 
                    value={num} 
                    disabled={unit === 'auto'}
                    onChange={e => handleNumChange(e.target.value)} 
                />
                <select 
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs w-[60px]"
                    value={unit}
                    onChange={e => handleUnitChange(e.target.value)}
                >
                    <option value="px">px</option>
                    <option value="%">%</option>
                    <option value="vw">vw</option>
                    <option value="vh">vh</option>
                    <option value="auto">auto</option>
                </select>
            </div>
        </div>
    );
}

// --- COMMON STYLE EDITOR ---
function CommonStyleEditor({ props, onChange, customFonts = [], onUploadFont, onUploadBackground }: {
    props: any,
    onChange: (k: string, v: any) => void,
    customFonts?: { name: string, url: string }[],
    onUploadFont?: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onUploadBackground?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
    // ... (rest is same)

    // ... inside return ...
    // Merge default fonts with custom fonts
    const defaultFonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display', 'Merriweather', 'Caveat', 'Great Vibes', 'Dancing Script'];
    const fontOptions = [...defaultFonts, ...customFonts.map(f => f.name)];

    return (
        <div className="space-y-4 border-t pt-4 mt-4">
            <div className="pb-2 border-b mb-2 flex justify-between items-center">
                <Label className="text-xs font-bold text-gray-500 uppercase">Global Styles</Label>
            </div>

            <div className="space-y-2 border-b pb-4">
                <div className="space-y-1">
                    <Label className="text-[10px]">Font Family</Label>
                    <SelectWrapper value={props.fontFamily} onChange={v => onChange('fontFamily', v)}
                        options={fontOptions} />
                </div>

                {onUploadFont && (
                    <div className="pt-1">
                        <Label htmlFor="font-upload" className="cursor-pointer bg-gray-50 border border-dashed border-gray-300 rounded-md p-1.5 flex items-center justify-center gap-2 hover:bg-gray-100 text-[10px] w-full text-gray-600">
                            <UploadCloud className="w-3 h-3" /> Upload Custom Font (.ttf/.otf)
                        </Label>
                        <input id="font-upload" type="file" className="hidden" accept=".ttf,.otf,.woff,.woff2" onChange={onUploadFont} />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <Label className="text-[10px]">Text Align</Label>
                    <SelectWrapper value={props.align} onChange={v => onChange('align', v)} options={['left', 'center', 'right', 'justify']} />
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px]">Text Color</Label>
                    <div className="flex gap-1">
                        <Input type="color" className="w-8 h-8 p-1" value={props.color || '#000000'} onChange={e => onChange('color', e.target.value)} />
                        <Input className="text-[10px] h-8" value={props.color || ''} onChange={e => onChange('color', e.target.value)} placeholder="#000000" />
                    </div>
                </div>
            </div>

            <div className="space-y-2 border-b pb-4 pt-2">
                <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-gray-500 uppercase">Background</Label>
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px]">Bg Color</Label>
                    <div className="flex gap-1">
                        <Input type="color" className="w-8 h-8 p-1" value={props.backgroundColor || '#ffffff00'} onChange={e => onChange('backgroundColor', e.target.value)} />
                        <Input className="text-[10px] h-8" value={props.backgroundColor || ''} onChange={e => onChange('backgroundColor', e.target.value)} placeholder="transparent" />
                    </div>
                </div>

                <div className="space-y-1">
                    <Label className="text-[10px]">Bg Image</Label>
                    <div className="flex gap-2 mb-1">
                        <Input className="text-[10px] h-8" value={props.backgroundImage || ''} onChange={e => onChange('backgroundImage', e.target.value)} placeholder="https://..." />
                    </div>
                    {onUploadBackground && (
                        <div className="pt-1">
                            <Label htmlFor="bg-upload" className="cursor-pointer bg-gray-50 border border-dashed border-gray-300 rounded-md p-1.5 flex items-center justify-center gap-2 hover:bg-gray-100 text-[10px] w-full text-gray-600">
                                <UploadCloud className="w-3 h-3" /> Upload Image
                            </Label>
                            <input id="bg-upload" type="file" className="hidden" accept="image/*" onChange={onUploadBackground} />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <Label className="text-[10px]">Size</Label>
                        <SelectWrapper value={props.backgroundSize} onChange={v => onChange('backgroundSize', v)} options={['cover', 'contain', 'auto', '100% 100%']} />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px]">Position</Label>
                        <SelectWrapper value={props.backgroundPosition} onChange={v => onChange('backgroundPosition', v)} options={['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right']} />
                    </div>
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px]">Repeat</Label>
                    <SelectWrapper value={props.backgroundRepeat} onChange={v => onChange('backgroundRepeat', v)} options={['no-repeat', 'repeat', 'repeat-x', 'repeat-y']} />
                </div>
            </div>

            <div className="space-y-2 border-b pb-4 pt-2">
                <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-gray-500 uppercase">Overlay</Label>
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px]">Overlay Color</Label>
                    <div className="flex gap-1">
                        <Input type="color" className="w-8 h-8 p-1" value={props.overlayColor?.slice(0, 7) || '#000000'}
                            onChange={e => {
                                // Simple hex to rgba could be better, but for now let's just save hex and use opacity separately or use 8-digit hex? 
                                // Browsers support 8-digit hex (#RRGGBBAA).
                                onChange('overlayColor', e.target.value + '80') // Default to 50% opacity if setting new color
                            }} />
                        <Input className="text-[10px] h-8" value={props.overlayColor || ''} onChange={e => onChange('overlayColor', e.target.value)} placeholder="#00000080" />
                    </div>
                    <p className="text-[9px] text-gray-400">Use 8-digit hex for transparency (e.g., #00000080 for 50% black)</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <Label className="text-[10px]">Padding (Y)</Label>
                    <SelectWrapper value={props.paddingY} onChange={v => onChange('paddingY', v)} options={['0px', '4px', '8px', '16px', '24px', '32px', '48px', '64px']} />
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px]">Padding (X)</Label>
                    <SelectWrapper value={props.paddingX} onChange={v => onChange('paddingX', v)} options={['0px', '4px', '8px', '16px', '24px', '32px', '48px', '64px']} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <Label className="text-[10px]">Margin (Top)</Label>
                    <SelectWrapper value={props.marginTop} onChange={v => onChange('marginTop', v)} options={['0px', '4px', '8px', '16px', '24px', '32px']} />
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px]">Margin (Bot)</Label>
                    <SelectWrapper value={props.marginBottom} onChange={v => onChange('marginBottom', v)} options={['0px', '4px', '8px', '16px', '24px', '32px']} />
                </div>
            </div>

            <div className="space-y-2 border-b pb-4 pt-2">
                 <Label className="text-[10px] font-bold text-gray-500 uppercase">Sizing</Label>
                 <div className="grid grid-cols-2 gap-2">
                    <SizeControl label="Width" value={props.width || '100%'} onChange={v => onChange('width', v)} />
                    <SizeControl label="Height" value={props.height || 'auto'} onChange={v => onChange('height', v)} />
                 </div>
            </div>
            <div className="space-y-1">
                <Label className="text-[10px]">Rounded Corners</Label>
                <SelectWrapper value={props.borderRadius} onChange={v => onChange('borderRadius', v)} options={['0px', '4px', '8px', '12px', '16px', '24px', '999px']} />
            </div>
        </div>
    );
}

function ElementEditor({ element, onChange, onAddChildElement, customFonts, onUploadFont }: {
    element: PageElement,
    onChange: (p: any) => void,
    onAddChildElement?: (newElement: PageElement) => void,
    customFonts: { name: string, url: string }[],
    onUploadFont: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
    const handleChange = (k: string, v: any) => onChange({ [k]: v });

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMultiple: boolean = false, targetKey: string = 'src') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const uploadPromise = async () => {
            const newUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append("file", files[i]);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) throw new Error("Upload failed");
                const data = await response.json() as { url: string };
                newUrls.push(data.url);
            }
            return newUrls;
        };

        toast.promise(uploadPromise(), {
            loading: 'Uploading...',
            success: (urls) => {
                if (isMultiple) {
                    const currentImages = element.props[targetKey] ? element.props[targetKey] + "\n" : "";
                    handleChange(targetKey, currentImages + urls.join("\n"));
                } else {
                    handleChange(targetKey, urls[0]);
                }
                return 'Upload complete!';
            },
            error: 'Upload failed',
        });
    };

    const specificEditor = () => {
        switch (element.type) {
            case 'text':
                return (
                    <>
                        <div className="space-y-1">
                            <Label>Content</Label>
                            <Textarea value={element.props.content} onChange={e => handleChange('content', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label>Size</Label>
                                <SelectWrapper value={element.props.fontSize} onChange={v => handleChange('fontSize', v)} options={['12px', '14px', '16px', '18px', '24px', '32px', '48px', '64px', '96px']} />
                            </div>
                            <div className="space-y-1">
                                <Label>Weight</Label>
                                <SelectWrapper value={element.props.fontWeight} onChange={v => handleChange('fontWeight', v)} options={['normal', 'bold', '300', '600', '800', '900']} />
                            </div>
                        </div>
                    </>
                );
            case 'image':
                return (
                    <>
                        <div className="space-y-1">
                            <Label>Image Source</Label>
                            <div className="flex gap-2">
                                <Input value={element.props.src} onChange={e => handleChange('src', e.target.value)} placeholder="https://..." />
                            </div>
                            <div className="mt-2">
                                <Label htmlFor="img-upload" className="cursor-pointer bg-gray-100 border border-dashed border-gray-300 rounded-md p-2 flex items-center justify-center gap-2 hover:bg-gray-200 text-sm py-2 w-full">
                                    <UploadCloud className="w-4 h-4" /> Upload Image
                                </Label>
                                <input id="img-upload" type="file" className="hidden" accept="image/*" onChange={e => handleUpload(e)} />
                            </div>
                        </div>
                        <div className="space-y-1">
                             <p className="text-xs text-gray-400">Width is now controlled in Global Styles below</p>
                        </div>
                    </>
                );
            case 'button':
                return (
                    <>
                        <div className="space-y-1">
                            <Label>Label</Label>
                            <Input value={element.props.text} onChange={e => handleChange('text', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Link</Label>
                            <Input value={element.props.link} onChange={e => handleChange('link', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Variant</Label>
                            <SelectWrapper value={element.props.variant} onChange={v => handleChange('variant', v)} options={['default', 'outline', 'ghost', 'link']} />
                        </div>
                    </>
                );
            case 'video':
                return (
                    <>
                        <div className="space-y-1">
                            <Label>YouTube Embed URL</Label>
                            <Input value={element.props.url} onChange={e => handleChange('url', e.target.value)} placeholder="https://www.youtube.com/embed/..." />
                        </div>
                        <div className="space-y-1">
                            <Label>Height</Label>
                            <SelectWrapper value={element.props.height} onChange={v => handleChange('height', v)} options={['200px', '300px', '400px', '500px']} />
                        </div>
                    </>
                );
            case 'map':
                return (
                    <>
                        <div className="space-y-1">
                            <Label>Height</Label>
                            <SelectWrapper value={element.props.height} onChange={v => handleChange('height', v)} options={['200px', '300px', '400px', '500px']} />
                        </div>
                        <p className="text-xs text-orange-500">Note: Dynamic Maps require Google API Key configuration.</p>
                    </>
                );
            case 'divider':
                return (
                    <>
                        <div className="space-y-1">
                            <Label>Color</Label>
                            <Input type="color" className="w-full h-8 p-1" value={element.props.color} onChange={e => handleChange('color', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Style</Label>
                            <SelectWrapper value={element.props.style} onChange={v => handleChange('style', v)} options={['solid', 'dashed', 'dotted']} />
                        </div>
                        <div className="space-y-1">
                            <Label>Thickness</Label>
                            <SelectWrapper value={element.props.thickness} onChange={v => handleChange('thickness', v)} options={['1px', '2px', '4px', '8px']} />
                        </div>
                    </>
                );
            case 'spacer': return null; // Spacer relies mostly on common styling (height/margin)
            case 'countdown':
                return (
                    <>
                        <div className="space-y-1">
                            <Label>Target Date & Time</Label>
                            <Input type="datetime-local" value={element.props.targetDate} onChange={e => handleChange('targetDate', e.target.value)} />
                        </div>
                    </>
                );
            case 'rsvp':
                return (
                    <>
                        <div className="space-y-1">
                            <Label>Form Title</Label>
                            <Input value={element.props.title} onChange={e => handleChange('title', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Description</Label>
                            <Textarea value={element.props.description} onChange={e => handleChange('description', e.target.value)} />
                        </div>
                    </>
                );
            case 'gallery':
                return (
                    <div className="space-y-1">
                        <Label>Images</Label>
                        <div className="mb-2">
                            <Label htmlFor="gallery-upload" className="cursor-pointer bg-gray-100 border border-dashed border-gray-300 rounded-md p-2 flex items-center justify-center gap-2 hover:bg-gray-200 text-sm py-2 w-full">
                                <UploadCloud className="w-4 h-4" /> Upload Images (Multiple)
                            </Label>
                            <input id="gallery-upload" type="file" className="hidden" accept="image/*" multiple onChange={e => handleUpload(e, true)} />
                        </div>
                        <Textarea
                            rows={5}
                            value={element.props.images}
                            onChange={e => handleChange('images', e.target.value)}
                            className="font-mono text-xs"
                        />
                    </div>
                );
            case 'container':
                return (
                    <>
                        <div className="space-y-1">
                            <Label>Layout Type</Label>
                            <SelectWrapper value={element.props.layout || 'horizontal'} onChange={v => handleChange('layout', v)} options={['horizontal', 'vertical', 'grid']} />
                        </div>

                        {element.props.layout === 'grid' ? (
                            <div className="space-y-1">
                                <Label>Columns</Label>
                                <Input type="number" min="1" max="12" value={element.props.columns || 2} onChange={e => handleChange('columns', parseInt(e.target.value) || 1)} />
                            </div>
                        ) : (
                            <div className="space-y-2 border-b pb-2 mb-2">
                                <Label className="text-xs font-semibold text-gray-500">Flexbox Settings</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Justify Content</Label>
                                        <select 
                                            className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                                            value={element.props.justifyContent || 'flex-start'} 
                                            onChange={e => handleChange('justifyContent', e.target.value)}
                                        >
                                            <option value="flex-start">Start</option>
                                            <option value="center">Center</option>
                                            <option value="flex-end">End</option>
                                            <option value="space-between">Space Between</option>
                                            <option value="space-around">Space Around</option>
                                            <option value="space-evenly">Space Evenly</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Align Items</Label>
                                        <select 
                                            className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                                            value={element.props.alignItems || 'flex-start'} 
                                            onChange={e => handleChange('alignItems', e.target.value)}
                                        >
                                            <option value="flex-start">Start</option>
                                            <option value="center">Center</option>
                                            <option value="flex-end">End</option>
                                            <option value="stretch">Stretch</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Wrap</Label>
                                        <select 
                                            className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                                            value={element.props.flexWrap || 'nowrap'} 
                                            onChange={e => handleChange('flexWrap', e.target.value)}
                                        >
                                            <option value="nowrap">No Wrap</option>
                                            <option value="wrap">Wrap</option>
                                            <option value="wrap-reverse">Wrap Reverse</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label>Gap</Label>
                                <SelectWrapper value={element.props.gap || '16px'} onChange={v => handleChange('gap', v)} options={['0px', '4px', '8px', '16px', '24px', '32px', '48px']} />
                            </div>
                            <div className="space-y-1">

                                <Label>Width</Label>
                                <p className="text-xs text-gray-400">Use Global Styles below for precise width/height</p>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t mt-2">
                            <Label className="text-xs font-semibold">Container Elements</Label>
                            <div className="flex gap-2">
                                <select 
                                    className="flex-1 border rounded p-2 text-sm"
                                    id="containerElementType"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Select element type...</option>
                                    <option value="text">Text</option>
                                    <option value="image">Image</option>
                                    <option value="button">Button</option>
                                    <option value="divider">Divider</option>
                                    <option value="spacer">Spacer</option>
                                    <option value="container">Container (Nested)</option>
                                </select>
                                <Button 
                                    size="sm"
                                    onClick={() => {
                                        const select = document.getElementById('containerElementType') as HTMLSelectElement | null;
                                        const elementType = select?.value as ElementType;
                                        if (elementType && onAddChildElement) {
                                            const newElement: PageElement = {
                                                id: crypto.randomUUID(),
                                                type: elementType,
                                                props: getDefaultProps(elementType)
                                            };
                                            
                                            onAddChildElement(newElement);
                                            
                                            if (select) select.value = '';
                                        }
                                    }}
                                >
                                    Add
                                </Button>
                            </div>
                            {element.elements && element.elements.length > 0 && (
                                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                    {element.elements.length} element(s) inside container
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 italic">Advanced layout controls enabled.</p>
                    </>
                );
            default: return null;
        }
    };

    return (
        <div className="space-y-4">
            {specificEditor()}
            <CommonStyleEditor props={element.props} onChange={handleChange} customFonts={customFonts} onUploadFont={onUploadFont} />
        </div>
    );
}

function SelectWrapper({ value, onChange, options }: { value: string, onChange: (v: string) => void, options: string[] }) {
    return (
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" value={value} onChange={e => onChange(e.target.value)}>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    );
}

function ElementLayer({ element, selectedElementId, onSelect, level }: { element: PageElement, selectedElementId: string | null, onSelect: (id: string) => void, level: number }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = element.elements && element.elements.length > 0;
    
    return (
        <div>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(element.id);
                }}
                className={`p-2 rounded text-xs flex items-center gap-2 cursor-pointer ${selectedElementId === element.id ? 'bg-purple-100 text-purple-700 font-medium' : 'hover:bg-gray-50'}`}
                style={{ marginLeft: `${level * 16}px` }}
            >
                {hasChildren && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                        className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded"
                    >
                        {isExpanded ? '▼' : '▶'}
                    </button>
                )}
                {!hasChildren && <span className="w-4" />}
                {getIconForType(element.type)}
                <span className="capitalize">{element.type}</span>
                {hasChildren && <span className="text-gray-400">({element.elements?.length})</span>}
            </div>
            
            {hasChildren && isExpanded && element.elements!.map(child => (
                <ElementLayer
                    key={child.id}
                    element={child}
                    selectedElementId={selectedElementId}
                    onSelect={onSelect}
                    level={level + 1}
                />
            ))}
        </div>
    );
}
