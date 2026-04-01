declare module "react-speech-recognition" {
  export type UseSpeechRecognitionOptions = {
    clearTranscriptOnListen?: boolean;
    commands?: unknown[];
  };

  export type UseSpeechRecognitionResult = {
    transcript: string;
    interimTranscript: string;
    finalTranscript: string;
    listening: boolean;
    resetTranscript: () => void;
    browserSupportsSpeechRecognition: boolean;
    isMicrophoneAvailable?: boolean;
  };

  export type StartListeningOptions = {
    continuous?: boolean;
    language?: string;
  };

  export function useSpeechRecognition(
    options?: UseSpeechRecognitionOptions
  ): UseSpeechRecognitionResult;

  const SpeechRecognition: {
    startListening: (options?: StartListeningOptions) => Promise<void> | void;
    stopListening: () => Promise<void> | void;
    abortListening?: () => Promise<void> | void;
  };

  export default SpeechRecognition;
}