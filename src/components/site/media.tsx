import Image from 'next/image';
import { LoopVideo } from '@/components/motion/loop-video';
import type { Media as MediaData } from '@/lib/content/schema';

type Props = {
  media: MediaData;
  sizes: string;
  priority?: boolean;
  fit?: 'contain' | 'cover';
  /** Fills the positioned parent instead of sizing from the file's own dimensions. */
  fill?: boolean;
  position?: string;
  className?: string;
};

/** Renders any stored image or video: uploads, bundled samples, or an external link. */
export function Media({ media, sizes, priority, fit = 'cover', fill, position, className = '' }: Props) {
  if (!media.src) return null;

  const style = fill ? { objectFit: fit, objectPosition: position } : undefined;

  if (media.kind === 'video') {
    const ratio = !fill && media.width && media.height ? { aspectRatio: `${media.width} / ${media.height}` } : undefined;
    return (
      <LoopVideo
        src={media.src}
        poster={media.poster || undefined}
        aria-label={media.alt || undefined}
        controls={!fill}
        className={`${fill ? 'absolute inset-0 h-full w-full' : 'block h-auto w-full'} ${className}`}
        style={{ ...style, ...ratio }}
      />
    );
  }

  const isLocal = media.src.startsWith('/') && !media.src.startsWith('//');
  if (!isLocal) {
    return (
      // External links can't go through the image optimiser without configuring each host.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={media.src}
        alt={media.alt}
        loading={priority ? 'eager' : 'lazy'}
        className={`${fill ? 'absolute inset-0 h-full w-full' : 'block h-auto w-full'} ${className}`}
        style={style}
      />
    );
  }

  const placeholder = media.blur ? { placeholder: 'blur' as const, blurDataURL: media.blur } : {};

  if (fill || !media.width || !media.height) {
    return (
      <Image
        src={media.src}
        alt={media.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
        style={{ objectFit: fit, objectPosition: position }}
        {...placeholder}
      />
    );
  }

  return (
    <Image
      src={media.src}
      alt={media.alt}
      width={media.width}
      height={media.height}
      sizes={sizes}
      priority={priority}
      className={`block h-auto w-full ${className}`}
      {...placeholder}
    />
  );
}
