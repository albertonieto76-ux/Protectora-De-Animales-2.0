const SUPPORTED_MIMES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export const fileToDataUrl = (file: Express.Multer.File): string | null => {
  if (!SUPPORTED_MIMES.has(file.mimetype)) {
    return null;
  }

  const base64 = file.buffer.toString("base64");
  return `data:${file.mimetype};base64,${base64}`;
};

export const filesToDataUrls = (files: Express.Multer.File[] | undefined): string[] => {
  if (!files || files.length === 0) {
    return [];
  }

  return files
    .map((file) => fileToDataUrl(file))
    .filter((value): value is string => Boolean(value));
};
