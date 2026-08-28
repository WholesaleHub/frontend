import { useState } from "react";
import { Package } from "lucide-react";
import { resolveImageUrl } from "../../services/productService";

type ProductImageProps = {
  imageUrl: string | null | undefined;
  alt: string;
  className?: string;
  iconSize?: number;
};

export default function ProductImage({
  imageUrl,
  alt,
  className = "",
  iconSize = 32,
}: ProductImageProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const resolved = resolveImageUrl(imageUrl);
  const failed = resolved !== null && resolved === failedUrl;

  if (!resolved || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        role="img"
        aria-label={`${alt} image unavailable`}
      >
        <Package size={iconSize} className="text-gray-300" />
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={`object-cover ${className}`}
      onError={() => setFailedUrl(resolved)}
    />
  );
}
