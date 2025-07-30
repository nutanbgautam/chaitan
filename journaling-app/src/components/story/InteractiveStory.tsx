import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Target, 
  Heart, 
  TrendingUp, 
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  Share2,
  Download,
  Bookmark
} from 'lucide-react';

interface StoryData {
  narrative: string;
  timeline: any[];
  character: any;
  journey: any;
  reflection: any;
}

interface InteractiveStoryProps {
  storyData: StoryData;
  onClose?: () => void;
}

const InteractiveStory: React.FC<InteractiveStoryProps> = ({ storyData, onClose }) => {
  const [activeStoryType, setActiveStoryType] = useState('narrative');
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const storyTypes = [
    { id: 'narrative', name: 'Narrative', icon: BookOpen },
    { id: 'timeline', name: 'Timeline', icon: Clock },
    { id: 'character', name: 'Character', icon: Star },
    { id: 'journey', name: 'Journey', icon: TrendingUp },
    { id: 'reflection', name: 'Reflection', icon: Lightbulb }
  ];

  const renderNarrativeStory = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg">
        <p className="text-lg text-gray-700 leading-relaxed italic">
          "{storyData.narrative}"
        </p>
      </div>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Pause' : 'Play'} Story
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </motion.div>
  );

  const renderTimelineStory = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        {storyData.timeline.map((entry, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex items-start gap-4 mb-6"
          >
            <div className="relative z-10 flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{index + 1}</span>
            </div>
            <div className="flex-1 bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">
                  {entry.date.toLocaleDateString()}
                </h4>
                <span className="text-2xl">{entry.mood}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Entries:</span>
                  <span className="font-semibold ml-1">{entry.entries}</span>
                </div>
                <div>
                  <span className="text-gray-600">Words:</span>
                  <span className="font-semibold ml-1">{entry.totalWords}</span>
                </div>
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="font-semibold ml-1">{entry.highlight}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderCharacterStory = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{storyData.character.name}</h3>
        <p className="text-gray-600">Your personal growth story</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traits */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Character Traits
          </h4>
          <div className="flex flex-wrap gap-2">
            {storyData.character.traits.map((trait: string, index: number) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {trait}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-500" />
            Achievements
          </h4>
          <ul className="space-y-2">
            {storyData.character.achievements.map((achievement: string, index: number) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 text-sm"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {achievement}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Growth Areas */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            Growth Areas
          </h4>
          <ul className="space-y-2">
            {storyData.character.growth.map((area: string, index: number) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 text-sm"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {area}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Challenges */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-500" />
            Challenges Faced
          </h4>
          <ul className="space-y-2">
            {storyData.character.challenges.map((challenge: string, index: number) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 text-sm"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                {challenge}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );

  const renderJourneyStory = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{storyData.journey.title}</h3>
        <p className="text-gray-600">Your personal journey through time</p>
      </div>

      {/* Chapters */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800">Chapters</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storyData.journey.chapters.map((chapter: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                currentChapter === index ? 'bg-green-50 border-green-200' : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => setCurrentChapter(index)}
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-gray-800">{chapter.title}</h5>
                <span className="text-sm text-gray-500">{chapter.entries} entries</span>
              </div>
              <p className="text-sm text-gray-600">{chapter.summary}</p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  chapter.theme === 'Growth' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {chapter.theme}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      {storyData.journey.milestones.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">Milestones</h4>
          <div className="space-y-3">
            {storyData.journey.milestones.map((milestone: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-white rounded-lg border"
              >
                <div className={`w-3 h-3 rounded-full ${
                  milestone.impact === 'high' ? 'bg-red-500' :
                  milestone.impact === 'positive' ? 'bg-green-500' :
                  'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-800">{milestone.title}</h5>
                  <p className="text-sm text-gray-600">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Lessons */}
      {storyData.journey.lessons.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">Lessons Learned</h4>
          <div className="space-y-4">
            {storyData.journey.lessons.map((lesson: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border"
              >
                <h5 className="font-semibold text-gray-800 mb-2">{lesson.lesson}</h5>
                <p className="text-sm text-gray-600 mb-2">{lesson.insight}</p>
                <p className="text-sm text-gray-700 font-medium">{lesson.application}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderReflectionStory = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Reflection & Growth</h3>
        <p className="text-gray-600">Deep insights and self-discovery</p>
      </div>

      {/* Reflection Questions */}
      <div className="bg-white p-6 rounded-lg border">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
          Reflection Questions
        </h4>
        <div className="space-y-3">
          {storyData.reflection.questions.map((question: string, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 bg-gray-50 rounded-lg"
            >
              <p className="text-sm text-gray-700">{question}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {storyData.reflection.insights.length > 0 && (
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-semibold text-gray-800 mb-4">Key Insights</h4>
          <div className="space-y-4">
            {storyData.reflection.insights.map((insight: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-l-4 border-blue-500 pl-4"
              >
                <h5 className="font-semibold text-gray-800 mb-1">{insight.category}</h5>
                <p className="text-sm text-gray-600 mb-2">{insight.insight}</p>
                <p className="text-sm text-gray-700 italic">{insight.reflection}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Patterns */}
      {storyData.reflection.patterns.length > 0 && (
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-semibold text-gray-800 mb-4">Patterns Identified</h4>
          <div className="flex flex-wrap gap-2">
            {storyData.reflection.patterns.map((pattern: string, index: number) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
              >
                {pattern}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Growth Areas */}
      {storyData.reflection.growth.length > 0 && (
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-semibold text-gray-800 mb-4">Areas for Growth</h4>
          <div className="space-y-2">
            {storyData.reflection.growth.map((area: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 text-sm"
              >
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                {area}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderStoryContent = () => {
    switch (activeStoryType) {
      case 'narrative':
        return renderNarrativeStory();
      case 'timeline':
        return renderTimelineStory();
      case 'character':
        return renderCharacterStory();
      case 'journey':
        return renderJourneyStory();
      case 'reflection':
        return renderReflectionStory();
      default:
        return renderNarrativeStory();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Interactive Story</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`p-2 rounded-lg ${
                bookmarked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button className="p-2 bg-gray-100 text-gray-600 rounded-lg">
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
            >
              ×
            </button>
          </div>
        </div>

        {/* Story Type Selector */}
        <div className="flex border-b overflow-x-auto">
          {storyTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveStoryType(type.id)}
              className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-colors ${
                activeStoryType === type.id
                  ? 'bg-green-100 text-green-700 border-b-2 border-green-500'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <type.icon className="w-4 h-4" />
              {type.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {renderStoryContent()}
        </div>
      </motion.div>
    </div>
  );
};

export default InteractiveStory; 