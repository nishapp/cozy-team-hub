
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Defines the response from the text-to-speech edge function
interface TextToSpeechResponse {
  audio: string; // Base64 encoded audio
  format: string; // Audio format (e.g., 'mp3')
}

/**
 * Converts text to speech using the Supabase Edge Function
 * @param text The text to convert to speech
 * @param voiceId Optional voice ID to use (defaults to ElevenLabs Rachel voice)
 * @returns Promise with the URL to the audio blob
 */
export const convertTextToSpeech = async (
  text: string, 
  voiceId?: string
): Promise<string | null> => {
  try {
    // Limit text length to avoid issues with large content
    const trimmedText = text.length > 3000 
      ? text.substring(0, 3000) + "..." 
      : text;
    
    const { data, error } = await supabase.functions.invoke<TextToSpeechResponse>('text-to-speech', {
      body: { 
        text: trimmedText,
        voice_id: voiceId
      }
    });
    
    if (error) {
      throw new Error(error.message || 'Failed to convert text to speech');
    }
    
    if (!data || !data.audio) {
      throw new Error('No audio data received');
    }
    
    // Convert base64 to Blob
    const byteCharacters = atob(data.audio);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    const blob = new Blob(byteArrays, { type: `audio/${data.format || 'mpeg'}` });
    
    // Create audio URL
    const url = URL.createObjectURL(blob);
    return url;
    
  } catch (error) {
    console.error('Error converting text to speech:', error);
    toast.error('Failed to generate audio');
    return null;
  }
};

/**
 * Revokes a URL created with URL.createObjectURL to free browser memory
 * @param url The URL to revoke
 */
export const revokeAudioUrl = (url: string | null) => {
  if (url) {
    URL.revokeObjectURL(url);
  }
};
