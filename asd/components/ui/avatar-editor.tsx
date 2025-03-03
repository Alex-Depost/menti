"use client";

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import React, { useCallback, useRef, useState } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { toast } from 'react-hot-toast';

interface AvatarEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (blob: Blob) => Promise<void>;
  aspectRatio?: number;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export function AvatarEditor({ open, onClose, onSave, aspectRatio = 1 }: AvatarEditorProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState<number>(1);
  const [rotate, setRotate] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        // Reset crop, scale, and rotate when new image is loaded
        setCrop(undefined);
        setScale(1);
        setRotate(0);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
  };

  const handleSave = useCallback(async () => {
    try {
      if (!imgRef.current || !completedCrop) {
        return;
      }

      setLoading(true);

      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      // Calculate the size of the cropped image
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Set canvas dimensions to the cropped size
      const pixelRatio = window.devicePixelRatio;
      canvas.width = completedCrop.width * scaleX * pixelRatio;
      canvas.height = completedCrop.height * scaleY * pixelRatio;

      // Scale the canvas context for higher resolution
      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = 'high';

      // Calculate the center of the canvas
      const centerX = canvas.width / 2 / pixelRatio;
      const centerY = canvas.height / 2 / pixelRatio;

      // Save the current context state
      ctx.save();

      // Move to the center of the canvas
      ctx.translate(centerX, centerY);
      // Rotate around the center
      ctx.rotate((rotate * Math.PI) / 180);
      // Scale the image
      ctx.scale(scale, scale);
      // Move back to the top left corner
      ctx.translate(-centerX, -centerY);

      // Draw the cropped image
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY
      );

      // Restore the context state
      ctx.restore();

      // Convert canvas to blob
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            toast.error('Ошибка при загрузке аватара');
            setLoading(false);
            return;
          }

          // Save the cropped image
          await onSave(blob);
          setLoading(false);
          onClose();
        },
        'image/jpeg',
        0.95
      );
    } catch (error) {
      toast.error('Ошибка при загрузке аватара');
      setLoading(false);
    }
  }, [completedCrop, imgRef, onSave, onClose, rotate, scale]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Reset state when dialog is opened
  React.useEffect(() => {
    if (open) {
      // Reset states when dialog opens
      if (!imgSrc) {
        setScale(1);
        setRotate(0);
        setCrop(undefined);
        setCompletedCrop(undefined);
      }
    }
  }, [open, imgSrc]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактирование аватара</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!imgSrc ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
              <p className="mb-4 text-center text-gray-500">
                Выберите изображение для загрузки
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onSelectFile}
                className="hidden"
              />
              <Button onClick={triggerFileInput}>Выбрать файл</Button>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(c: Crop) => setCrop(c)}
                  onComplete={(c: PixelCrop) => setCompletedCrop(c)}
                  aspect={aspectRatio}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imgSrc}
                    style={{
                      transform: `scale(${scale}) rotate(${rotate}deg)`,
                      maxHeight: '400px',
                      maxWidth: '100%'
                    }}
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              </div>

              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Масштаб</span>
                    <span className="text-sm">{scale.toFixed(2)}x</span>
                  </div>
                  <Slider
                    value={[scale]}
                    min={0.5}
                    max={3}
                    step={0.01}
                    onValueChange={(value: number[]) => setScale(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Поворот</span>
                    <span className="text-sm">{rotate}°</span>
                  </div>
                  <Slider
                    value={[rotate]}
                    min={-180}
                    max={180}
                    step={1}
                    onValueChange={(value: number[]) => setRotate(value[0])}
                  />
                </div>

                {/* Image editing controls above */}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!completedCrop || loading}>
            {loading ? "Сохранение..." : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}