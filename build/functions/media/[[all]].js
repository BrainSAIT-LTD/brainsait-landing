// Media handler for serving files from R2 bucket
export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    // Remove '/media/' from the path to get the key in R2
    const path = url.pathname.replace('/media/', '');
    
    // Get the object from R2
    const object = await context.env.MEDIA.get(path);
    
    if (object === null) {
      return new Response('File not found', { status: 404 });
    }
    
    // Set appropriate headers based on file type
    const headers = new Headers();
    const contentType = getContentType(path);
    headers.set('Content-Type', contentType);
    
    // Set cache control for better performance
    headers.set('Cache-Control', 'public, max-age=31536000');
    
    // Return the file
    return new Response(object.body, {
      headers
    });
  } catch (error) {
    return new Response(`Error fetching media: ${error.message}`, { status: 500 });
  }
}

// Helper function to determine content type
function getContentType(path) {
  const extension = path.split('.').pop().toLowerCase();
  const contentTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mp3': 'audio/mpeg',
    'pdf': 'application/pdf',
    'json': 'application/json',
    'js': 'application/javascript',
    'css': 'text/css',
    'html': 'text/html',
    'txt': 'text/plain',
  };
  
  return contentTypes[extension] || 'application/octet-stream';
}
