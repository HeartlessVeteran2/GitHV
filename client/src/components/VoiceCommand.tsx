import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

interface VoiceCommandProps {
  isListening: boolean;
  onToggleListening: () => void;
  onCommand: (command: string, confidence: number) => void;
}

interface VoiceCommand {
  trigger: string[];
  action: string;
  description: string;
  examples: string[];
}

export default function VoiceCommand({ 
  isListening, 
  onToggleListening, 
  onCommand 
}: VoiceCommandProps) {
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  // Available voice commands
  const commands: VoiceCommand[] = [
    {
      trigger: ["save file", "save", "save current file"],
      action: "save",
      description: "Save the current file",
      examples: ["Save file", "Save the document"]
    },
    {
      trigger: ["open file", "open", "show files"],
      action: "open-files",
      description: "Open file explorer",
      examples: ["Open file", "Show files"]
    },
    {
      trigger: ["run code", "execute", "run", "start"],
      action: "run",
      description: "Execute the current code",
      examples: ["Run code", "Execute this", "Start the program"]
    },
    {
      trigger: ["open terminal", "terminal", "console"],
      action: "terminal",
      description: "Open integrated terminal",
      examples: ["Open terminal", "Show console"]
    },
    {
      trigger: ["search", "find", "search files"],
      action: "search",
      description: "Open global search",
      examples: ["Search files", "Find in project"]
    },
    {
      trigger: ["git status", "show changes", "git"],
      action: "git-status",
      description: "Show git status",
      examples: ["Git status", "Show changes"]
    },
    {
      trigger: ["commit", "git commit", "save changes"],
      action: "git-commit",
      description: "Commit changes",
      examples: ["Commit changes", "Git commit"]
    },
    {
      trigger: ["new file", "create file"],
      action: "new-file",
      description: "Create a new file",
      examples: ["New file", "Create file"]
    },
    {
      trigger: ["zoom in", "bigger"],
      action: "zoom-in",
      description: "Increase font size",
      examples: ["Zoom in", "Make it bigger"]
    },
    {
      trigger: ["zoom out", "smaller"],
      action: "zoom-out",
      description: "Decrease font size",
      examples: ["Zoom out", "Make it smaller"]
    },
    {
      trigger: ["settings", "preferences", "config"],
      action: "settings",
      description: "Open settings",
      examples: ["Open settings", "Show preferences"]
    },
    {
      trigger: ["gcloud projects", "list projects", "cloud projects"],
      action: "cli-gcloud-projects",
      description: "List Google Cloud projects",
      examples: ["List Google Cloud projects", "Show GCloud projects"]
    },
    {
      trigger: ["github repos", "list repos", "show repositories"],
      action: "cli-gh-repos",
      description: "List GitHub repositories",
      examples: ["List GitHub repos", "Show repositories"]
    },
    {
      trigger: ["explain code", "gemini explain", "analyze this"],
      action: "cli-gemini-explain",
      description: "Explain code with Gemini AI",
      examples: ["Explain this code", "What does this do"]
    },
    {
      trigger: ["generate tests", "create tests", "gemini tests"],
      action: "cli-gemini-test",
      description: "Generate tests with Gemini AI",
      examples: ["Generate tests", "Create unit tests"]
    }
  ];

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('Voice recognition started');
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            setConfidence(result[0].confidence);
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript);
        
        if (finalTranscript) {
          handleVoiceCommand(finalTranscript, event.results[event.resultIndex][0].confidence);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice Command Error",
          description: `Speech recognition failed: ${event.error}`,
          variant: "destructive"
        });
        onToggleListening();
      };
      
      recognition.onend = () => {
        if (isListening) {
          // Restart recognition if still listening
          setTimeout(() => {
            try {
              recognition.start();
            } catch (error) {
              console.error('Failed to restart recognition:', error);
            }
          }, 100);
        }
      };
      
      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!recognitionRef.current || !isSupported) return;
    
    if (isListening) {
      try {
        recognitionRef.current.start();
        setTranscript("");
      } catch (error) {
        console.error('Failed to start recognition:', error);
        toast({
          title: "Voice Command Error",
          description: "Failed to start voice recognition",
          variant: "destructive"
        });
      }
    } else {
      recognitionRef.current.stop();
      setTranscript("");
    }
  }, [isListening, isSupported, toast]);

  const handleVoiceCommand = (transcript: string, confidence: number) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    
    // Find matching command
    const matchedCommand = commands.find(command =>
      command.trigger.some(trigger => 
        lowerTranscript.includes(trigger.toLowerCase())
      )
    );
    
    if (matchedCommand && confidence > 0.7) {
      onCommand(matchedCommand.action, confidence);
      speakResponse(`Executing ${matchedCommand.description}`);
      
      toast({
        title: "Voice Command Recognized",
        description: `${matchedCommand.description} (${Math.round(confidence * 100)}% confidence)`,
      });
    } else if (confidence > 0.5) {
      speakResponse("Sorry, I didn't understand that command");
      toast({
        title: "Command Not Recognized",
        description: "Try one of the supported voice commands",
        variant: "destructive"
      });
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleMute = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isSupported) {
    return (
      <Card className="p-4 bg-dark-surface border-dark-border">
        <div className="text-center text-gray-400">
          <MicOff className="h-8 w-8 mx-auto mb-2" />
          <p>Voice commands not supported in this browser</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-dark-surface border-dark-border">
      <div className="space-y-4">
        {/* Voice Control Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Voice Commands</h3>
          <div className="flex items-center space-x-2">
            <Badge variant={isListening ? "default" : "outline"}>
              {isListening ? "Listening" : "Stopped"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-gray-400"
            >
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Voice Control Button */}
        <div className="flex items-center space-x-4">
          <Button
            variant={isListening ? "destructive" : "default"}
            onClick={onToggleListening}
            className="flex items-center space-x-2"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            <span>{isListening ? "Stop Listening" : "Start Voice Commands"}</span>
          </Button>
          
          {isListening && (
            <div className="flex-1">
              <div className="text-sm text-gray-400">
                {transcript || "Listening..."}
              </div>
              {confidence > 0 && (
                <div className="text-xs text-gray-500">
                  Confidence: {Math.round(confidence * 100)}%
                </div>
              )}
            </div>
          )}
        </div>

        {/* Available Commands */}
        {!isListening && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Available Commands:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {commands.slice(0, 6).map((command, index) => (
                <div key={index} className="text-gray-400">
                  <span className="text-gray-300">"{command.trigger[0]}"</span>
                  <span className="ml-1">- {command.description}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Speak clearly and wait for the beep before giving commands.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}