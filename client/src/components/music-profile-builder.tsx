import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Music, 
  Play, 
  Heart, 
  Mic, 
  Headphones, 
  Volume2, 
  Star,
  Plus,
  X,
  Search,
  Disc3,
  Radio,
  Brain,
  Camera,
  User
} from "lucide-react";
import MusicPersonalityQuiz from "./music-personality-quiz";
import PhotoUpload from "./photo-upload";

const MUSIC_GENRES = [
  "Pop", "Rock", "Hip-Hop", "Electronic", "Indie", "Jazz", "Country", "R&B",
  "Classical", "Folk", "Reggae", "Blues", "Punk", "Metal", "Alternative", "Soul",
  "Funk", "House", "Techno", "Ambient", "Latin", "K-Pop", "Trap", "Lo-Fi"
];

const POPULAR_ARTISTS = [
  // Pop
  "Taylor Swift", "Ed Sheeran", "Adele", "Ariana Grande", "Dua Lipa", "Harry Styles", "Olivia Rodrigo",
  "Bruno Mars", "Justin Bieber", "Rihanna", "Lady Gaga", "Katy Perry", "P!nk", "Miley Cyrus", "Selena Gomez",
  
  // Hip-Hop/Rap
  "Drake", "Kendrick Lamar", "J. Cole", "Travis Scott", "Post Malone", "Tyler, The Creator", "Kanye West",
  "Eminem", "Jay-Z", "Nas", "Future", "Lil Wayne", "Nicki Minaj", "Cardi B", "Megan Thee Stallion", "21 Savage",
  
  // R&B/Soul
  "Beyoncé", "The Weeknd", "SZA", "Frank Ocean", "H.E.R.", "Alicia Keys", "John Legend", "Miguel",
  "Daniel Caesar", "Summer Walker", "Jhené Aiko", "Chris Brown", "Usher", "Bruno Mars", "Anderson .Paak",
  
  // Rock/Alternative
  "The Beatles", "Queen", "Radiohead", "The Strokes", "Arctic Monkeys", "Foo Fighters", "Red Hot Chili Peppers",
  "Nirvana", "Pearl Jam", "Led Zeppelin", "Pink Floyd", "The Rolling Stones", "AC/DC", "Metallica", "Green Day",
  "Coldplay", "U2", "Linkin Park", "Imagine Dragons", "OneRepublic", "Maroon 5", "Fall Out Boy", "Panic! At The Disco",
  
  // Electronic/EDM
  "Daft Punk", "Calvin Harris", "David Guetta", "Skrillex", "Deadmau5", "Marshmello", "The Chainsmokers",
  "Avicii", "Swedish House Mafia", "Martin Garrix", "Tiësto", "Diplo", "Flume", "ODESZA", "Porter Robinson",
  
  // Indie/Alternative
  "Billie Eilish", "Lorde", "Phoebe Bridgers", "Clairo", "Rex Orange County", "Mac DeMarco", "Tame Impala",
  "The 1975", "Vampire Weekend", "MGMT", "Foster the People", "Two Door Cinema Club", "Glass Animals", "Alt-J",
  
  // Country
  "Taylor Swift", "Kacey Musgraves", "Chris Stapleton", "Maren Morris", "Keith Urban", "Carrie Underwood",
  "Blake Shelton", "Luke Bryan", "Florida Georgia Line", "Dan + Shay", "The Chicks", "Johnny Cash", "Dolly Parton",
  
  // K-Pop
  "BTS", "BLACKPINK", "TWICE", "Red Velvet", "ITZY", "aespa", "SEVENTEEN", "Stray Kids", "ENHYPEN", "(G)I-DLE",
  
  // Latin
  "Bad Bunny", "J Balvin", "Ozuna", "Karol G", "Rosalía", "Shakira", "Maluma", "Daddy Yankee", "Luis Fonsi",
  
  // Jazz/Blues
  "Miles Davis", "John Coltrane", "Billie Holiday", "Ella Fitzgerald", "Louis Armstrong", "Duke Ellington",
  "Nina Simone", "B.B. King", "Muddy Waters", "Etta James", "Norah Jones", "Diana Krall",
  
  // Classical/Instrumental
  "Ludwig van Beethoven", "Wolfgang Amadeus Mozart", "Johann Sebastian Bach", "Frédéric Chopin", "Claude Debussy",
  "Ludovico Einaudi", "Max Richter", "Ólafur Arnalds", "Nils Frahm", "GoGo Penguin",
  
  // Reggae/Caribbean
  "Bob Marley", "Damian Marley", "Sean Paul", "Shaggy", "Jimmy Buffett", "Steel Pulse", "Chronixx",
  
  // Folk/Acoustic
  "Bob Dylan", "Joni Mitchell", "Neil Young", "Fleet Foxes", "The Lumineers", "Mumford & Sons", "Of Monsters and Men",
  "Iron & Wine", "Bon Iver", "Sufjan Stevens", "Father John Misty", "Big Thief", "Angel Olsen"
];

const LISTENING_HABITS = [
  "Morning coffee vibes",
  "Workout playlists",
  "Late night drives",
  "Study sessions",
  "Party anthems",
  "Rainy day moods",
  "Road trip classics",
  "Cooking background music"
];

interface MusicProfileData {
  favoriteGenres: string[];
  favoriteArtists: string[];
  favoriteSongs: string[];
  topDefiningTracks: string[];
  listeningHabits: string[];
  musicPersonality: string[];
  concertExperience: number;
  discoveryPreference: string;
  musicMood: string;
  bio: string;
  personalityType?: string;
  personalityTraits?: string[];
  profilePhotos?: string[];
  // Basic user info
  name?: string;
  email?: string;
  username?: string;
  age?: number;
}

interface MusicProfileBuilderProps {
  onComplete: (profileData: MusicProfileData) => void;
  isLoading?: boolean;
  initialData?: Partial<MusicProfileData>;
}

export default function MusicProfileBuilder({ onComplete, isLoading, initialData }: MusicProfileBuilderProps) {
  const [step, setStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<MusicProfileData>({
    favoriteGenres: [],
    favoriteArtists: [],
    favoriteSongs: [],
    topDefiningTracks: [],
    listeningHabits: [],
    musicPersonality: [],
    concertExperience: 5,
    discoveryPreference: "algorithm",
    musicMood: "varied",
    bio: "",
    personalityType: "",
    personalityTraits: [],
    profilePhotos: [],
    name: "",
    email: "",
    username: "",
    age: undefined
  });

  // Initialize with existing data and check if user is editing
  useEffect(() => {
    if (initialData) {
      console.log('Initializing with data:', initialData);
      console.log('Initial data has photos:', initialData.profilePhotos?.length || 0);
      
      setProfileData(prev => {
        // Don't overwrite existing photos in state unless the initial data has more photos
        const shouldUpdatePhotos = !prev.profilePhotos || 
          prev.profilePhotos.length === 0 || 
          (initialData.profilePhotos && initialData.profilePhotos.length > prev.profilePhotos.length);
          
        const newData = {
          ...prev,
          ...initialData,
          // Preserve existing photos unless initial data has more
          profilePhotos: shouldUpdatePhotos ? (initialData.profilePhotos || []) : prev.profilePhotos
        };
        console.log('Profile data after initialization:', newData);
        console.log('Photos after init:', newData.profilePhotos?.length || 0);
        console.log('Should update photos:', shouldUpdatePhotos);
        return newData;
      });
      
      // Check if profile is already complete
      if (initialData.favoriteGenres && initialData.favoriteGenres.length > 0) {
        setIsEditing(true);
      }
    }
  }, [initialData]);

  const [searchInputs, setSearchInputs] = useState({
    artist: "",
    song: ""
  });

  const totalSteps = 9;
  const progress = (step / totalSteps) * 100;

  const updateProfileData = (updates: Partial<MusicProfileData>) => {
    console.log('Updating profile data:', updates);
    setProfileData(prev => {
      const newData = { ...prev, ...updates };
      console.log('New profile data:', newData);
      
      // Special handling for profilePhotos to ensure they persist
      if (updates.profilePhotos) {
        console.log('ProfilePhotos being updated:', updates.profilePhotos.length);
        console.log('First photo preview:', updates.profilePhotos[0]?.substring(0, 50));
      }
      
      return newData;
    });
  };

  const toggleArrayItem = (array: string[], item: string, maxItems?: number) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    } else if (!maxItems || array.length < maxItems) {
      return [...array, item];
    }
    return array;
  };

  const addCustomItem = (field: keyof MusicProfileData, value: string) => {
    if (value.trim()) {
      const currentArray = profileData[field] as string[];
      if (!currentArray.includes(value.trim())) {
        updateProfileData({
          [field]: [...currentArray, value.trim()]
        });
      }
    }
  };

  const removeItem = (field: keyof MusicProfileData, item: string) => {
    const currentArray = profileData[field] as string[];
    updateProfileData({
      [field]: currentArray.filter(i => i !== item)
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1: return (profileData.profilePhotos?.length || 0) >= 1;
      case 2: return profileData.name && profileData.email && profileData.username && profileData.age; // Basic info
      case 3: return profileData.favoriteGenres.length >= 3;
      case 4: return profileData.favoriteArtists.length >= 3;
      case 5: return profileData.favoriteSongs.length >= 2;
      case 6: return profileData.topDefiningTracks.length >= 3;
      case 7: return profileData.listeningHabits.length >= 2;
      case 8: return true; // Music personality quiz (optional)
      case 9: return profileData.bio.length >= 20;
      default: return true;
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      console.log(`Moving from step ${step} to ${step + 1}, photos in profileData:`, profileData.profilePhotos?.length || 0);
      console.log('Current profileData state at step transition:', {
        step: step,
        photos: profileData.profilePhotos?.length || 0,
        firstPhoto: profileData.profilePhotos?.[0]?.substring(0, 30)
      });
      setStep(step + 1);
    } else {
      console.log('=== PROFILE COMPLETION DEBUGGING ===');
      console.log('Current step:', step);
      console.log('Total steps:', totalSteps);
      console.log('Full ProfileData state:', JSON.stringify(profileData, null, 2));
      console.log('ProfileData.profilePhotos:', profileData.profilePhotos);
      console.log('ProfileData.profilePhotos length:', profileData.profilePhotos?.length || 0);
      console.log('ProfileData.profilePhotos type:', typeof profileData.profilePhotos);
      console.log('ProfileData.profilePhotos isArray:', Array.isArray(profileData.profilePhotos));
      
      if (profileData.profilePhotos && profileData.profilePhotos.length > 0) {
        console.log('First photo exists:', profileData.profilePhotos[0]?.substring(0, 50));
        console.log('All photos exist:', profileData.profilePhotos.map((p, i) => `Photo ${i}: ${p.substring(0, 50)}...`));
      } else {
        console.log('NO PHOTOS FOUND IN PROFILE DATA AT COMPLETION');
      }
      
      console.log('=== CALLING onComplete FROM nextStep ===');
      console.log('About to send profileData:', JSON.stringify(profileData, null, 2));
      onComplete(profileData);
    }
  };

  const goBackToSummary = () => {
    if (isEditing) {
      setStep(1);
      // Reset to summary view
      setIsEditing(true);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else if (isEditing) {
      // Go back to summary view
      setIsEditing(true);
      setStep(1);
    }
  };

  // Show completed profile summary if editing (but not if actively uploading photos)
  if (isEditing && step === 1 && !(profileData.profilePhotos && profileData.profilePhotos.length > 0)) {
    console.log('=== RENDERING EDITING SUMMARY ===');
    console.log('ProfileData in editing summary:', {
      photos: profileData.profilePhotos?.length || 0,
      firstPhoto: profileData.profilePhotos?.[0]?.substring(0, 30),
      isArray: Array.isArray(profileData.profilePhotos)
    });
    
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Music className="w-6 h-6 text-music-purple" />
            <h1 className="text-2xl font-bold text-gray-800">Your Music Profile</h1>
          </div>
          <p className="text-gray-600">Your profile is complete! You can edit any section below.</p>
        </div>

        {/* Profile Summary Cards */}
        <div className="space-y-4">
          {/* Photo Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-music-purple" />
                <span>Profile Photos ({profileData.profilePhotos?.length || 0})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profileData.profilePhotos && profileData.profilePhotos.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profileData.profilePhotos.slice(0, 3).map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Profile photo ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ))}
                  {profileData.profilePhotos.length > 3 && (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-500">
                      +{profileData.profilePhotos.length - 3}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No photos uploaded</p>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => {
                  console.log('=== EDITING PHOTOS BUTTON CLICKED ===');
                  console.log('Current photos before editing:', profileData.profilePhotos?.length || 0);
                  console.log('Full profileData before photo editing:', profileData);
                  setIsEditing(false);
                  setStep(1);
                }}
              >
                Edit Photos
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Music className="w-5 h-5 text-music-purple" />
                <span>Favorite Genres ({profileData.favoriteGenres.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profileData.favoriteGenres.map((genre, index) => (
                  <Badge key={index} variant="secondary">{genre}</Badge>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => {
                  setIsEditing(false);
                  setStep(2);
                }}
              >
                Edit Genres
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mic className="w-5 h-5 text-music-purple" />
                <span>Favorite Artists ({profileData.favoriteArtists.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profileData.favoriteArtists.slice(0, 6).map((artist, index) => (
                  <Badge key={index} variant="secondary">{artist}</Badge>
                ))}
                {profileData.favoriteArtists.length > 6 && (
                  <Badge variant="outline">+{profileData.favoriteArtists.length - 6} more</Badge>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => {
                  setIsEditing(false);
                  setStep(2);
                }}
              >
                Edit Artists
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-music-purple" />
                <span>Profile Bio</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-sm mb-3">{profileData.bio || "No bio yet"}</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setStep(7);
                }}
              >
                Edit Bio
              </Button>
            </CardContent>
          </Card>

          {profileData.personalityType && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-music-purple" />
                  <span>Music Personality</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="music-gradient-purple-pink text-white mb-2">
                  {profileData.personalityType}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setStep(7);
                  }}
                >
                  Retake Quiz
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex space-x-4">
          <Button 
            onClick={() => {
              setIsEditing(false);
              setStep(1);
            }} 
            variant="outline"
            className="flex-1"
          >
            Edit Step by Step
          </Button>
          <Button 
            onClick={() => {
              console.log('=== SAVE CHANGES - EDITING MODE COMPLETION ===');
              console.log('ProfileData in editing mode:', profileData);
              console.log('Photos in editing mode:', profileData.profilePhotos?.length || 0);
              console.log('Full profileData being sent:', JSON.stringify(profileData, null, 2));
              
              if (profileData.profilePhotos && profileData.profilePhotos.length > 0) {
                console.log('Photos exist in editing mode, first photo:', profileData.profilePhotos[0]?.substring(0, 50));
              } else {
                console.log('NO PHOTOS IN EDITING MODE COMPLETION');
              }
              
              // Create a fresh copy of profileData to ensure no state mutations
              const finalData = {
                ...profileData,
                profilePhotos: profileData.profilePhotos || []
              };
              
              console.log('=== CALLING onComplete FROM SAVE CHANGES ===');
              console.log('Final data being sent:', finalData);
              onComplete(finalData);
            }}
            disabled={isLoading}
            className="flex-1 music-gradient-purple-pink text-white"
          >
            {isLoading ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Music className="w-6 h-6 text-music-purple" />
          <h1 className="text-2xl font-bold text-gray-800">Build Your Music Profile</h1>
        </div>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-600">Step {step} of {totalSteps}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Step 1: Profile Photos */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <Camera className="w-12 h-12 mx-auto text-music-purple" />
                <h2 className="text-xl font-bold">Add your photos</h2>
                <p className="text-gray-600">Upload up to 5 photos to showcase yourself</p>
              </div>

              <PhotoUpload
                photos={profileData.profilePhotos || []}
                onPhotosChange={(photos) => {
                  console.log('Photos changed in music profile builder:', photos.length);
                  console.log('Setting profilePhotos to:', photos);
                  console.log('Current profileData before update:', profileData);
                  
                  setProfileData(prev => {
                    const newData = {
                      ...prev,
                      profilePhotos: [...photos] // Create new array to ensure state update
                    };
                    console.log('New profileData after photo update:', newData);
                    console.log('Specifically photos in new data:', newData.profilePhotos?.length || 0);
                    console.log('Photo data persistence check:', newData.profilePhotos);
                    return newData;
                  });
                  
                  // Stay in editing mode if photos are uploaded
                  if (photos.length > 0) {
                    console.log('Photos uploaded, staying in editing mode');
                    setIsEditing(true);
                  }
                  
                  // Force re-render to ensure state is updated
                  console.log('Forcing component re-render after photo update');
                }}
                maxPhotos={5}
              />
            </div>
          )}

          {/* Step 2: Basic User Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <User className="w-12 h-12 mx-auto text-music-purple" />
                <h2 className="text-xl font-bold">Tell us about yourself</h2>
                <p className="text-gray-600">Basic information to complete your profile</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={profileData.name || ""}
                    onChange={(e) => updateProfileData({ name: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={profileData.email || ""}
                    onChange={(e) => updateProfileData({ email: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <Input
                    type="text"
                    placeholder="Choose a unique username"
                    value={profileData.username || ""}
                    onChange={(e) => updateProfileData({ username: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter your age"
                    value={profileData.age || ""}
                    onChange={(e) => updateProfileData({ age: parseInt(e.target.value) || undefined })}
                    min="18"
                    max="100"
                    className="w-full"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Heart className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Privacy & Security</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Your email will only be used for account security and important updates. 
                        Your username will be visible to other users.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Favorite Genres */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <Disc3 className="w-12 h-12 mx-auto text-music-purple" />
                <h2 className="text-xl font-bold">What genres move you?</h2>
                <p className="text-gray-600">Choose at least 3 genres that define your taste</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {MUSIC_GENRES.map((genre) => (
                    <Button
                      key={genre}
                      variant={profileData.favoriteGenres.includes(genre) ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateProfileData({
                        favoriteGenres: toggleArrayItem(profileData.favoriteGenres, genre, 8)
                      })}
                      className={`rounded-full transition ${
                        profileData.favoriteGenres.includes(genre)
                          ? "bg-music-purple text-white hover:bg-music-purple/90"
                          : "hover:border-music-purple hover:text-music-purple"
                      }`}
                    >
                      {genre}
                    </Button>
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Selected: {profileData.favoriteGenres.length}/8
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Favorite Artists */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <Mic className="w-12 h-12 mx-auto text-music-pink" />
                <h2 className="text-xl font-bold">Who are your music heroes?</h2>
                <p className="text-gray-600">Add at least 3 artists you love</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search or add custom artist..."
                    value={searchInputs.artist}
                    onChange={(e) => setSearchInputs({ ...searchInputs, artist: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addCustomItem('favoriteArtists', searchInputs.artist);
                        setSearchInputs({ ...searchInputs, artist: "" });
                      }
                    }}
                    className="pl-10"
                  />
                  {searchInputs.artist && (
                    <Button
                      size="sm"
                      onClick={() => {
                        addCustomItem('favoriteArtists', searchInputs.artist);
                        setSearchInputs({ ...searchInputs, artist: "" });
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-2"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {POPULAR_ARTISTS
                    .filter(artist => 
                      !profileData.favoriteArtists.includes(artist) &&
                      artist.toLowerCase().includes(searchInputs.artist.toLowerCase())
                    )
                    .slice(0, 12)
                    .map((artist) => (
                    <Button
                      key={artist}
                      variant="outline"
                      size="sm"
                      onClick={() => updateProfileData({
                        favoriteArtists: toggleArrayItem(profileData.favoriteArtists, artist, 10)
                      })}
                      className="rounded-full hover:border-music-pink hover:text-music-pink"
                    >
                      {artist}
                    </Button>
                  ))}
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Your Artists:</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.favoriteArtists.map((artist) => (
                      <Badge key={artist} className="bg-music-pink text-white flex items-center gap-1">
                        {artist}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-gray-200" 
                          onClick={() => removeItem('favoriteArtists', artist)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Selected: {profileData.favoriteArtists.length}/10
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Favorite Songs */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <Heart className="w-12 h-12 mx-auto text-music-orange" />
                <h2 className="text-xl font-bold">Songs that define you</h2>
                <p className="text-gray-600">Add at least 2 songs you absolutely love</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Add your favorite songs (Song - Artist)..."
                    value={searchInputs.song}
                    onChange={(e) => setSearchInputs({ ...searchInputs, song: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addCustomItem('favoriteSongs', searchInputs.song);
                        setSearchInputs({ ...searchInputs, song: "" });
                      }
                    }}
                    className="pl-10"
                  />
                  {searchInputs.song && (
                    <Button
                      size="sm"
                      onClick={() => {
                        addCustomItem('favoriteSongs', searchInputs.song);
                        setSearchInputs({ ...searchInputs, song: "" });
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-2"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Your Songs:</h3>
                  <div className="space-y-2">
                    {profileData.favoriteSongs.map((song, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Play className="w-4 h-4 text-music-orange" />
                          <span className="font-medium">{song}</span>
                        </div>
                        <X 
                          className="w-4 h-4 cursor-pointer text-gray-400 hover:text-gray-600" 
                          onClick={() => removeItem('favoriteSongs', song)}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Added: {profileData.favoriteSongs.length}/8
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Top 5 Defining Tracks */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <Star className="w-12 h-12 mx-auto text-music-purple" />
                <h2 className="text-xl font-bold">Your Top 5 Defining Tracks</h2>
                <p className="text-gray-600">Songs that truly define who you are (add at least 3)</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Add a song that defines you (Song - Artist)..."
                    value={searchInputs.song}
                    onChange={(e) => setSearchInputs({ ...searchInputs, song: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && profileData.topDefiningTracks.length < 5) {
                        addCustomItem('topDefiningTracks', searchInputs.song);
                        setSearchInputs({ ...searchInputs, song: "" });
                      }
                    }}
                    className="pl-10"
                    disabled={profileData.topDefiningTracks.length >= 5}
                  />
                  {searchInputs.song && profileData.topDefiningTracks.length < 5 && (
                    <Button
                      size="sm"
                      onClick={() => {
                        addCustomItem('topDefiningTracks', searchInputs.song);
                        setSearchInputs({ ...searchInputs, song: "" });
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-2"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Your Defining Tracks:</h3>
                  <div className="space-y-3">
                    {profileData.topDefiningTracks.map((song, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-music-purple/10 to-music-pink/10 rounded-lg border-l-4 border-music-purple">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-music-purple text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{song}</div>
                            <div className="text-sm text-gray-600">Defining track #{index + 1}</div>
                          </div>
                        </div>
                        <X 
                          className="w-4 h-4 cursor-pointer text-gray-400 hover:text-gray-600" 
                          onClick={() => removeItem('topDefiningTracks', song)}
                        />
                      </div>
                    ))}
                    
                    {/* Empty slots */}
                    {Array.from({ length: 5 - profileData.topDefiningTracks.length }, (_, i) => (
                      <div key={`empty-${i}`} className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">
                          {profileData.topDefiningTracks.length + i + 1}
                        </div>
                        <div className="text-gray-400">
                          Add track #{profileData.topDefiningTracks.length + i + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className={profileData.topDefiningTracks.length >= 3 ? "text-green-600" : "text-gray-500"}>
                      {profileData.topDefiningTracks.length >= 3 ? "✓" : "○"} Minimum 3 tracks
                    </span>
                    <span className="text-gray-500">
                      {profileData.topDefiningTracks.length}/5 tracks
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Heart className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">What makes a defining track?</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Choose songs that shaped your musical journey, represent important moments in your life, 
                        or capture your personality perfectly. These are the tracks you'd play to help someone understand who you are.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Listening Habits & Personality */}
          {step === 7 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <Headphones className="w-12 h-12 mx-auto text-music-blue" />
                <h2 className="text-xl font-bold">How do you experience music?</h2>
                <p className="text-gray-600">Tell us about your listening habits</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">When do you listen to music? (Select at least 2)</h3>
                  <div className="flex flex-wrap gap-2">
                    {LISTENING_HABITS.map((habit) => (
                      <Button
                        key={habit}
                        variant={profileData.listeningHabits.includes(habit) ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateProfileData({
                          listeningHabits: toggleArrayItem(profileData.listeningHabits, habit)
                        })}
                        className={`rounded-full ${
                          profileData.listeningHabits.includes(habit)
                            ? "bg-music-blue text-white"
                            : "hover:border-music-blue hover:text-music-blue"
                        }`}
                      >
                        {habit}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Concert Experience</h3>
                  <div className="space-y-3">
                    <Slider
                      value={[profileData.concertExperience]}
                      onValueChange={(value) => updateProfileData({ concertExperience: value[0] })}
                      max={50}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>First timer</span>
                      <span className="font-medium">{profileData.concertExperience} concerts</span>
                      <span>Concert veteran</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Music Personality Quiz */}
          {step === 8 && (
            <div className="space-y-6">
              <MusicPersonalityQuiz
                onComplete={(personality, answers) => {
                  updateProfileData({
                    personalityType: personality.type,
                    personalityTraits: personality.traits
                  });
                  nextStep();
                }}
                onSkip={() => {
                  updateProfileData({
                    personalityType: "explorer",
                    personalityTraits: ["Open minded", "Curiosity driven"]
                  });
                  nextStep();
                }}
              />
            </div>
          )}

          {/* Step 9: Bio & Final Details */}
          {step === 9 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <Star className="w-12 h-12 mx-auto text-music-purple" />
                <h2 className="text-xl font-bold">Tell your music story</h2>
                <p className="text-gray-600">Write a bio that shows your music personality</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Music Bio (minimum 20 characters)
                  </label>
                  <Textarea
                    placeholder="e.g., Vinyl collector with a soft spot for 90s grunge and modern indie. You'll find me at underground shows and spinning records at 2 AM. Looking for someone to share concerts and late-night music discovery sessions with..."
                    value={profileData.bio}
                    onChange={(e) => updateProfileData({ bio: e.target.value })}
                    className="min-h-[120px] resize-none"
                    maxLength={300}
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>{profileData.bio.length >= 20 ? "✓" : "○"} Minimum length</span>
                    <span>{profileData.bio.length}/300</span>
                  </div>
                </div>

                {/* Profile Summary */}
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Volume2 className="w-5 h-5" />
                      Your Music Profile Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="font-medium text-music-purple">{profileData.favoriteGenres.length}</span> genres, 
                      <span className="font-medium text-music-pink ml-1">{profileData.favoriteArtists.length}</span> artists, 
                      <span className="font-medium text-music-orange ml-1">{profileData.favoriteSongs.length}</span> songs,
                      <span className="font-medium text-purple-600 ml-1">{profileData.topDefiningTracks.length}</span> defining tracks
                    </div>
                    {profileData.personalityType && (
                      <div className="text-sm text-gray-600">
                        Music Personality: <span className="font-medium text-music-blue">{profileData.personalityType.replace('_', ' ')}</span>
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      Concert experience: {profileData.concertExperience} shows
                    </div>
                    <div className="text-sm text-gray-600">
                      Listening habits: {profileData.listeningHabits.slice(0, 3).join(", ")}
                      {profileData.listeningHabits.length > 3 && "..."}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={step === 1}
          className="flex items-center gap-2"
        >
          Previous
        </Button>

        <div className="flex space-x-1">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i + 1 <= step ? "bg-music-purple" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <Button
          onClick={nextStep}
          disabled={!canProceed() || isLoading}
          className="music-gradient-purple-pink text-white flex items-center gap-2"
        >
          {isLoading ? "Saving..." : step === totalSteps ? "Complete Profile" : "Next"}
        </Button>
      </div>
    </div>
  );
}