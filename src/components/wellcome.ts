/**
 * THE WELCOME FREQUENCY
 * Protocol: Play welcometo.wav upon successful identity grounding.
 * Location: /public/welcometo.wav
 */

export const playWelcomeAudio = async (): Promise<void> => {
  try {
    const audio = new Audio('/welcometo.wav');
    
    // The browser requires a user gesture (like the click on 'Ground Identity')
    // to allow audio playback.
    audio.volume = 0.8;
    
    await audio.play();
    console.log("AUDIO_PULSE_SENT: Welcometo.wav is manifesting.");
  } catch (error) {
    console.warn("AUDIO_SYNC_FRICTION: Browser blocked autonomous frequency.", error);
  }
};