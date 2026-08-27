// TODO: Replace with your actual Cloudinary credentials
// Cloudinary Console → Dashboard
// Create an unsigned upload preset in Settings → Upload → Upload presets
const CLOUDINARY_CLOUD_NAME = 'dqhajkbdg';
const CLOUDINARY_UPLOAD_PRESET = 'campus_lost_found';

/**
 * Upload a photo file to Cloudinary.
 * @param {File} file
 * @returns {Promise<string>} The secure image URL
 */
export async function uploadPhoto(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'campus-lost-and-found');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) throw new Error('Photo upload failed. Check your Cloudinary credentials.');
  const data = await response.json();
  return data.secure_url;
}
