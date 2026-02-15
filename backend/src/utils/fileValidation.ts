
/**
 * Validate file magic bytes to prevent malicious uploads claiming to be images.
 * @param buffer File buffer
 * @returns boolean true if valid image
 */
export const validateImageMagicBytes = (buffer: Buffer): boolean => {
    if (!buffer || buffer.length < 4) return false;

    const header = buffer.toString('hex', 0, 4).toUpperCase();

    // JPG: FF D8 FF
    if (header.startsWith('FFD8FF')) return true;

    // PNG: 89 50 4E 47
    if (header === '89504E47') return true;

    // WEBP: RIFF....WEBP (offset check needed)
    // RIFF header
    if (header === '52494646') {
        // Check for WEBP at offset 8
        const webpHeader = buffer.toString('hex', 8, 12).toUpperCase();
        if (webpHeader === '57454250') return true;
    }

    // GIF: 47 49 46 38
    if (header === '47494638') return true;

    return false;
};
