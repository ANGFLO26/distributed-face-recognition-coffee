// Image Service - Image processing (compress, resize, base64)
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { APP_CONFIG } from '../utils/constants';
import LogService from './LogService';

class ImageService {
  /**
   * Compress and resize image
   * @param {string} uri - Image URI
   * @returns {Promise<string>} Compressed image URI
   */
  async compressImage(uri) {
    try {
      LogService.debug('IMAGE', 'Compressing image', { uri });
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: APP_CONFIG.MAX_IMAGE_WIDTH } },
        ],
        {
          compress: APP_CONFIG.IMAGE_QUALITY,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      LogService.debug('IMAGE', 'Image compressed', { 
        originalUri: uri,
        compressedUri: manipulatedImage.uri,
      });
      return manipulatedImage.uri;
    } catch (error) {
      LogService.error('IMAGE', 'Failed to compress image', error);
      throw new Error('Failed to compress image');
    }
  }

  /**
   * Convert image to base64 string
   * @param {string} uri - Image URI
   * @returns {Promise<string>} Base64 encoded string
   */
  async imageToBase64(uri) {
    try {
      LogService.debug('IMAGE', 'Converting image to base64', { uri });
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      LogService.debug('IMAGE', 'Image converted to base64', { 
        base64Length: base64 ? base64.length : 0 
      });
      return base64;
    } catch (error) {
      LogService.error('IMAGE', 'Failed to convert image to base64', error);
      throw new Error('Failed to convert image to base64');
    }
  }

  /**
   * Process image: compress and convert to base64
   * @param {string} uri - Image URI
   * @returns {Promise<string>} Base64 encoded string
   */
  async processImage(uri) {
    try {
      // Step 1: Compress and resize
      const compressedUri = await this.compressImage(uri);
      
      // Step 2: Convert to base64
      const base64 = await this.imageToBase64(compressedUri);
      
      return base64;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }
}

export default new ImageService();

