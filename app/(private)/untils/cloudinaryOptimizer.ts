
export const getOptimizedImageUrl = (originalUrl: string, width: number = 800, quality: string = 'auto') => {
  if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
    return originalUrl; // Retorna original se não for do Cloudinary
  }
  
  // Quebra a URL para inserir as transformações
  const parts = originalUrl.split('/upload/');
  if (parts.length !== 2) return originalUrl;
  
  // Insere as transformações de otimização
  const transformations = `w_${width},c_limit,f_auto,q_${quality}`;
  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
};