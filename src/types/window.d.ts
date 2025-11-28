interface Window {
  gc?: () => void;
  webkitSpeechRecognition?: new () => SpeechRecognition;
  SpeechRecognition?: new () => SpeechRecognition;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}