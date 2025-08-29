import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Music, 
  Brain, 
  Heart, 
  Zap, 
  Compass, 
  Users, 
  Volume2, 
  Star,
  CheckCircle
} from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  options: {
    text: string;
    value: string;
    personalities: string[];
  }[];
}

interface PersonalityResult {
  type: string;
  name: string;
  description: string;
  traits: string[];
  icon: React.ReactNode;
  color: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "discovery",
    question: "How do you discover new music?",
    options: [
      {
        text: "Algorithm recommendations and playlists",
        value: "algorithmic",
        personalities: ["digital_native", "explorer"]
      },
      {
        text: "Friends' recommendations and social sharing",
        value: "social",
        personalities: ["social_butterfly", "connector"]
      },
      {
        text: "Music blogs, reviews, and critics",
        value: "curated",
        personalities: ["curator", "scholar"]
      },
      {
        text: "Radio, live performances, and chance encounters",
        value: "organic",
        personalities: ["purist", "wanderer"]
      }
    ]
  },
  {
    id: "mood",
    question: "Music affects your mood by...",
    options: [
      {
        text: "Amplifying whatever I'm already feeling",
        value: "amplifier",
        personalities: ["emotional", "intense"]
      },
      {
        text: "Helping me process and understand my emotions",
        value: "processor",
        personalities: ["therapist", "scholar"]
      },
      {
        text: "Completely changing how I feel",
        value: "transformer",
        personalities: ["shapeshifter", "healer"]
      },
      {
        text: "Providing consistent comfort and stability",
        value: "stabilizer",
        personalities: ["anchor", "loyalist"]
      }
    ]
  },
  {
    id: "listening",
    question: "Your ideal listening experience is...",
    options: [
      {
        text: "Complete focus with high-quality headphones",
        value: "focused",
        personalities: ["audiophile", "purist"]
      },
      {
        text: "Background soundtrack to daily activities",
        value: "background",
        personalities: ["multitasker", "casual"]
      },
      {
        text: "Shared with others - concerts, parties, gatherings",
        value: "social",
        personalities: ["social_butterfly", "connector"]
      },
      {
        text: "Spontaneous and varied depending on the moment",
        value: "spontaneous",
        personalities: ["explorer", "shapeshifter"]
      }
    ]
  },
  {
    id: "collection",
    question: "Your music collection is...",
    options: [
      {
        text: "Carefully curated with deep cuts and rare finds",
        value: "curated",
        personalities: ["curator", "scholar"]
      },
      {
        text: "Constantly evolving with the latest releases",
        value: "current",
        personalities: ["trendsetter", "digital_native"]
      },
      {
        text: "A mix of mainstream hits and personal favorites",
        value: "balanced",
        personalities: ["connector", "diplomat"]
      },
      {
        text: "Built around a few core artists I absolutely love",
        value: "focused",
        personalities: ["loyalist", "devotee"]
      }
    ]
  }
];

const PERSONALITY_TYPES: { [key: string]: PersonalityResult } = {
  "social_butterfly": {
    type: "social_butterfly",
    name: "The Social Butterfly",
    description: "Music is your social currency. You love sharing discoveries, attending shows with friends, and creating the perfect playlist for every gathering.",
    traits: ["Socially connected", "Great curator", "Event organizer", "Trend-aware"],
    icon: <Users className="w-6 h-6" />,
    color: "bg-pink-500"
  },
  "audiophile": {
    type: "audiophile",
    name: "The Audiophile",
    description: "You're all about the quality and craft of music. From sound engineering to instrumental technique, you appreciate music as an art form.",
    traits: ["Technical appreciation", "Quality focused", "Detail oriented", "Equipment enthusiast"],
    icon: <Volume2 className="w-6 h-6" />,
    color: "bg-purple-500"
  },
  "explorer": {
    type: "explorer",
    name: "The Musical Explorer",
    description: "You're constantly seeking new sounds and genres. Your playlist is a journey across cultures, decades, and musical landscapes.",
    traits: ["Genre diverse", "Adventure seeking", "Open minded", "Curiosity driven"],
    icon: <Compass className="w-6 h-6" />,
    color: "bg-blue-500"
  },
  "emotional": {
    type: "emotional",
    name: "The Emotional Connector",
    description: "Music is your emotional companion. Every song tells a story, and you feel each beat, lyric, and melody deeply in your soul.",
    traits: ["Emotionally intuitive", "Lyric focused", "Mood driven", "Deeply feeling"],
    icon: <Heart className="w-6 h-6" />,
    color: "bg-red-500"
  },
  "scholar": {
    type: "scholar",
    name: "The Music Scholar",
    description: "You approach music intellectually, studying artists' histories, album contexts, and musical evolution. You're a walking music encyclopedia.",
    traits: ["Research oriented", "Historically aware", "Context driven", "Knowledge seeker"],
    icon: <Brain className="w-6 h-6" />,
    color: "bg-indigo-500"
  },
  "trendsetter": {
    type: "trendsetter",
    name: "The Trendsetter",
    description: "You're always ahead of the curve, discovering tomorrow's hits today. Your friends come to you for the freshest sounds and emerging artists.",
    traits: ["Early adopter", "Trend predictor", "Influence driven", "Future focused"],
    icon: <Zap className="w-6 h-6" />,
    color: "bg-yellow-500"
  },
  "loyalist": {
    type: "loyalist",
    name: "The Loyal Fan",
    description: "You form deep connections with artists and stick with them through their entire journey. Quality over quantity is your motto.",
    traits: ["Artist devoted", "Consistency valued", "Deep connections", "Long-term focused"],
    icon: <Star className="w-6 h-6" />,
    color: "bg-green-500"
  },
  "curator": {
    type: "curator",
    name: "The Playlist Curator",
    description: "You're a master of mood and moment, creating perfect soundtracks for every occasion. Your playlists are works of art.",
    traits: ["Curation expert", "Mood specialist", "Flow conscious", "Storytelling focused"],
    icon: <Music className="w-6 h-6" />,
    color: "bg-teal-500"
  }
};

interface MusicPersonalityQuizProps {
  onComplete: (personality: PersonalityResult, answers: { [key: string]: string }) => void;
  onSkip?: () => void;
}

export default function MusicPersonalityQuiz({ onComplete, onSkip }: MusicPersonalityQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<PersonalityResult | null>(null);

  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate personality result
      const personalityResult = calculatePersonality(newAnswers);
      setResult(personalityResult);
      setShowResult(true);
    }
  };

  const calculatePersonality = (userAnswers: { [key: string]: string }): PersonalityResult => {
    const personalityScores: { [key: string]: number } = {};

    // Count personality type occurrences based on answers
    Object.entries(userAnswers).forEach(([questionId, answerValue]) => {
      const question = QUIZ_QUESTIONS.find(q => q.id === questionId);
      const selectedOption = question?.options.find(opt => opt.value === answerValue);
      
      if (selectedOption) {
        selectedOption.personalities.forEach(personality => {
          personalityScores[personality] = (personalityScores[personality] || 0) + 1;
        });
      }
    });

    // Find the personality type with the highest score
    const topPersonality = Object.entries(personalityScores)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "explorer";

    return PERSONALITY_TYPES[topPersonality] || PERSONALITY_TYPES["explorer"];
  };

  const handleComplete = () => {
    if (result) {
      onComplete(result, answers);
    }
  };

  const currentQ = QUIZ_QUESTIONS[currentQuestion];

  if (showResult && result) {
    return (
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <div className="text-center space-y-4 px-2">
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="w-7 h-7 text-green-500" />
            <h1 className="text-xl font-bold text-gray-800">Your Music Personality</h1>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        <Card className="border-2 border-music-purple/20 mx-4">
          <CardHeader className="text-center pb-4">
            <div className={`w-16 h-16 mx-auto rounded-full ${result.color} flex items-center justify-center text-white mb-3`}>
              {result.icon}
            </div>
            <CardTitle className="text-xl text-gray-800 leading-tight">{result.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 px-5 pb-6">
            <p className="text-gray-600 text-center leading-relaxed text-sm">
              {result.description}
            </p>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">Your Musical Traits:</h3>
              <div className="flex flex-wrap gap-2">
                {result.traits.map((trait, index) => (
                  <Badge 
                    key={index} 
                    className="bg-music-purple/10 text-music-purple border-music-purple/20 text-xs"
                  >
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-3">
                <Music className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800 text-sm">Compatibility Boost</h4>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    Your personality type will help us find matches who complement your music style and listening habits.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleComplete}
                className="w-full music-gradient-purple-pink text-white"
              >
                Continue with This Personality
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowResult(false);
                  setCurrentQuestion(0);
                  setAnswers({});
                }}
                className="w-full"
              >
                Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto p-2 space-y-4">
      {/* Header */}
      <div className="text-center space-y-2 px-1">
        <div className="flex items-center justify-center space-x-1">
          <Brain className="w-4 h-4 text-music-purple" />
          <h1 className="text-base font-bold text-gray-800">Music Personality Quiz</h1>
        </div>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
          </p>
        </div>
      </div>

      <Card className="mx-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-center leading-tight px-1">
            {currentQ.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-2 pb-6">
          {currentQ.options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => handleAnswer(currentQ.id, option.value)}
              className="w-full text-left justify-start h-auto py-2 px-2 hover:border-music-purple hover:bg-music-purple/5 transition-all border min-h-[2.5rem]"
            >
              <div className="flex items-start space-x-2 w-full">
                <div className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-[10px] leading-tight flex-1 text-left break-words overflow-hidden">
                  {option.text}
                </span>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Skip option */}
      <div className="text-center px-2">
        <Button
          variant="ghost"
          onClick={onSkip}
          className="text-gray-500 hover:text-gray-700 text-xs"
        >
          Skip personality quiz for now
        </Button>
      </div>
    </div>
  );
}