import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, User, Zap, Heart, Lightbulb, Code, Sparkles, 
  Brain, Coffee, Rocket, Shield, Target, Check
} from "lucide-react";

export interface AIPersonality {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  traits: string[];
  communicationStyle: string;
  specialties: string[];
  color: string;
  prompt: string;
}

const personalities: AIPersonality[] = [
  {
    id: "professional",
    name: "Professional",
    icon: <Bot className="h-5 w-5" />,
    description: "Formal, precise, and business-oriented assistant focused on efficiency",
    traits: ["Formal", "Precise", "Efficient", "Direct"],
    communicationStyle: "Clear, concise responses with technical accuracy",
    specialties: ["Code reviews", "Documentation", "Best practices", "Architecture"],
    color: "bg-blue-500",
    prompt: "You are a professional software development assistant. Provide precise, formal responses focused on best practices, code quality, and efficient solutions. Be direct and technical in your explanations."
  },
  {
    id: "friendly",
    name: "Friendly Mentor",
    icon: <Heart className="h-5 w-5" />,
    description: "Warm, encouraging, and supportive coding companion",
    traits: ["Encouraging", "Patient", "Supportive", "Warm"],
    communicationStyle: "Friendly and encouraging with detailed explanations",
    specialties: ["Learning", "Debugging", "Explanations", "Encouragement"],
    color: "bg-green-500",
    prompt: "You are a friendly and encouraging coding mentor. Be warm, patient, and supportive. Explain concepts clearly, celebrate small wins, and provide encouraging feedback while helping with code."
  },
  {
    id: "creative",
    name: "Creative Innovator",
    icon: <Lightbulb className="h-5 w-5" />,
    description: "Imaginative and innovative, thinks outside the box",
    traits: ["Creative", "Innovative", "Bold", "Experimental"],
    communicationStyle: "Enthusiastic with creative suggestions and alternatives",
    specialties: ["Problem solving", "Innovation", "Creative solutions", "Brainstorming"],
    color: "bg-purple-500",
    prompt: "You are a creative and innovative coding assistant. Think outside the box, suggest creative solutions, explore alternative approaches, and bring fresh perspectives to coding challenges."
  },
  {
    id: "expert",
    name: "Senior Expert",
    icon: <Brain className="h-5 w-5" />,
    description: "Highly experienced with deep technical knowledge and wisdom",
    traits: ["Expert", "Knowledgeable", "Wise", "Experienced"],
    communicationStyle: "Deep technical insights with advanced concepts",
    specialties: ["Advanced patterns", "Performance", "Scalability", "Complex problems"],
    color: "bg-indigo-500",
    prompt: "You are a senior software expert with decades of experience. Provide deep technical insights, advanced patterns, performance considerations, and architectural wisdom. Focus on scalable, maintainable solutions."
  },
  {
    id: "casual",
    name: "Casual Buddy",
    icon: <Coffee className="h-5 w-5" />,
    description: "Relaxed, conversational, and easy-going coding partner",
    traits: ["Casual", "Relaxed", "Conversational", "Easy-going"],
    communicationStyle: "Informal and conversational with practical advice",
    specialties: ["Quick fixes", "Practical tips", "Casual coding", "Simple solutions"],
    color: "bg-orange-500",
    prompt: "You are a casual, laid-back coding buddy. Keep things simple and conversational. Focus on practical solutions, quick fixes, and making coding feel approachable and fun."
  },
  {
    id: "motivator",
    name: "Productivity Coach",
    icon: <Rocket className="h-5 w-5" />,
    description: "High-energy motivator focused on productivity and achievement",
    traits: ["Energetic", "Motivating", "Goal-oriented", "Driven"],
    communicationStyle: "Energetic and motivating with actionable steps",
    specialties: ["Productivity", "Goal setting", "Optimization", "Workflow"],
    color: "bg-red-500",
    prompt: "You are an energetic productivity coach for developers. Be motivating, goal-oriented, and focus on optimizing workflows, achieving objectives, and maintaining high productivity in coding tasks."
  }
];

interface PersonalitySelectorProps {
  currentPersonality: string;
  onPersonalityChange: (personality: AIPersonality) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function PersonalitySelector({ 
  currentPersonality, 
  onPersonalityChange, 
  isOpen, 
  onClose 
}: PersonalitySelectorProps) {
  const [selectedPersonality, setSelectedPersonality] = useState(currentPersonality);

  if (!isOpen) return null;

  const handleSelect = (personality: AIPersonality) => {
    setSelectedPersonality(personality.id);
    onPersonalityChange(personality);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface border border-dark-border rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-dark-text">AI Assistant Personality</h2>
              <p className="text-gray-400 mt-1">Choose your preferred AI assistant personality</p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        <ScrollArea className="p-6 max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personalities.map((personality) => (
              <Card 
                key={personality.id}
                className={`cursor-pointer transition-all duration-200 border-2 ${
                  selectedPersonality === personality.id 
                    ? 'border-blue-500 bg-blue-50/5' 
                    : 'border-dark-border hover:border-gray-600'
                }`}
                onClick={() => handleSelect(personality)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${personality.color} text-white`}>
                        {personality.icon}
                      </div>
                      <CardTitle className="text-lg text-dark-text">
                        {personality.name}
                      </CardTitle>
                    </div>
                    {selectedPersonality === personality.id && (
                      <Check className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {personality.description}
                  </p>

                  <div>
                    <p className="text-xs font-medium text-gray-300 mb-2">Traits</p>
                    <div className="flex flex-wrap gap-1">
                      {personality.traits.map((trait) => (
                        <Badge 
                          key={trait} 
                          variant="secondary" 
                          className="text-xs bg-gray-700 text-gray-300"
                        >
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-300 mb-2">Specialties</p>
                    <div className="flex flex-wrap gap-1">
                      {personality.specialties.slice(0, 2).map((specialty) => (
                        <Badge 
                          key={specialty} 
                          variant="outline" 
                          className="text-xs border-gray-600 text-gray-400"
                        >
                          {specialty}
                        </Badge>
                      ))}
                      {personality.specialties.length > 2 && (
                        <Badge 
                          variant="outline" 
                          className="text-xs border-gray-600 text-gray-400"
                        >
                          +{personality.specialties.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-400">
                      <strong>Communication:</strong> {personality.communicationStyle}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-dark-border">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">
              Selected: <strong className="text-white">
                {personalities.find(p => p.id === selectedPersonality)?.name}
              </strong>
            </p>
            <div className="space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Apply Personality
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { personalities };