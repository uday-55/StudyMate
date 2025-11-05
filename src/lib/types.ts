export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}
