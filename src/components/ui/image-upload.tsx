"use client";

import { useState, useRef, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { useUploadThing } from "@/lib/uploadthing";
import { getCroppedImg } from "@/lib/canvas-utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Loader2, Upload, X, Check } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    aspectRatio?: number; // 1 = Square, 16/9 = Banner
    className?: string;
    endpoint?: "profileImage" | "productImages";
    children?: React.ReactNode;
}

export function ImageUpload({
    value,
    onChange,
    aspectRatio = 1,
    className,
    endpoint = "profileImage",
    children
}: ImageUploadProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { startUpload } = useUploadThing(endpoint, {
        onClientUploadComplete: (res) => {
            setIsUploading(false);
            if (res && res[0]) {
                onChange(res[0].url);
                toast.success("Zdjęcie wgrane pomyślnie!");
            }
            setIsOpen(false);
            setImageSrc(null);
            setUploadProgress(0);
        },
        onUploadError: (error) => {
            setIsUploading(false);
            toast.error(`Błąd uploadu: ${error.message}`);
        },
        onUploadProgress: (p) => {
            setUploadProgress(p);
        }
    });

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl);
            setIsOpen(true);
            e.target.value = "";
        }
    };

    const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        try {
            setIsUploading(true);
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);

            if (!croppedFile) throw new Error("Could not crop image");

            await startUpload([croppedFile]);
        } catch (e) {
            console.error(e);
            setIsUploading(false);
            toast.error("Wystąpił błąd podczas przetwarzania zdjęcia.");
        }
    };

    const handleRemove = () => {
        onChange("");
    };

    const triggerUpload = () => fileInputRef.current?.click();

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            <div onClick={triggerUpload}>
                {children ? (
                    <div className="cursor-pointer">
                        {children}
                    </div>
                ) : (
                    <div className="relative group overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 w-full max-w-[200px] aspect-square flex items-center justify-center cursor-pointer hover:border-zinc-700 transition-colors">
                        {value ? (
                            <>
                                <Image src={value} alt="Upload" fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove();
                                        }}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-2 text-zinc-400">
                                <Upload className="w-8 h-8" />
                                <span className="text-xs font-medium">Wgraj zdjęcie</span>
                            </div>
                        )}
                    </div>
                )}

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={onFileChange}
                />
            </div>

            <Dialog open={isOpen} onOpenChange={(open) => !isUploading && setIsOpen(open)}>
                <DialogContent className="sm:max-w-xl bg-zinc-950 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Wykadruj zdjęcie</DialogTitle>
                    </DialogHeader>

                    <div className="relative w-full h-[400px] bg-black rounded-md overflow-hidden border border-zinc-800">
                        {imageSrc && (
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspectRatio}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        )}
                    </div>

                    <div className="py-4 space-y-4">
                        <div className="flex justify-between text-xs text-zinc-400 uppercase tracking-wider">
                            <span>Przybliżenie</span>
                            <span>{Math.round(zoom * 100)}%</span>
                        </div>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(value) => setZoom(value[0])}
                            className="cursor-pointer"
                        />
                    </div>

                    <DialogFooter className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isUploading}
                            className="border-zinc-800 hover:bg-zinc-900 text-zinc-300"
                        >
                            Anuluj
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isUploading}
                            className="min-w-[120px] bg-red-600 hover:bg-red-700 text-white border-0"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {uploadProgress}%
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Zapisz
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function readFile(file: File): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => resolve(reader.result as string), false);
        reader.readAsDataURL(file);
    });
}
