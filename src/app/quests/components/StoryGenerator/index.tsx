'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useStoryStore } from '@/store/story';
import { Sparkles, BookOpen, Loader2, ChevronDown, ChevronUp, RefreshCw, Trash2 } from 'lucide-react';
import { OracleAnimation } from '@/components/ui/OracleAnimation';

export function StoryGenerator() {
  const { tasks, settings, aiModel, story: savedStory, setStory, clearStory } = useStoryStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStory, setShowStory] = useState(false);

  // Only show active tasks count
  const activeTasks = useMemo(() => 
    tasks.filter(task => task.status === 'active'),
    [tasks]
  );

  const handleGenerateStory = async () => {
    if (activeTasks.length === 0) {
      setError('No active tasks to generate story from');
      return;
    }

    if (!settings.universe || !settings.character || !settings.narrativeStyle) {
      setError('Please configure your story settings first');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tasks: activeTasks,
          settings,
          model: aiModel 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate story');
      }
      
      const story = await response.json();
      console.log('Generated story:', story);
      
      setStory(story);
      setShowStory(true);
    } catch (err) {
      console.error('Story generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate story');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearStory = () => {
    clearStory();
    setShowStory(false);
  };

  // Memoize story sections to prevent unnecessary re-renders
  const storyContent = useMemo(() => {
    if (!savedStory) return null;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="px-6 pb-6 space-y-6"
      >
        {/* Opening Scene */}
        <motion.div
          key="opening-scene"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <h4 className="font-semibold text-purple-500">Opening Scene</h4>
          <p className="text-sm text-muted-foreground">
            {savedStory.openingScene}
          </p>
        </motion.div>

        {/* Quest Narratives */}
        <motion.div
          key="quest-narratives"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h4 className="font-semibold text-purple-500">The Journey</h4>
          {savedStory.transformedTasks.map((quest, index) => (
            <div key={`quest-${index}`} className="space-y-2">
              <h5 className="font-medium">{quest.questName}</h5>
              <p className="text-sm text-muted-foreground">{quest.narrative}</p>
              <p className="text-sm italic text-purple-500/80">{quest.completion}</p>
            </div>
          ))}
        </motion.div>

        {/* Epilogue */}
        <motion.div
          key="epilogue"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-2"
        >
          <h4 className="font-semibold text-purple-500">Epilogue</h4>
          <p className="text-sm text-muted-foreground">
            {savedStory.epilogue}
          </p>
        </motion.div>
      </motion.div>
    );
  }, [savedStory]);

  return (
    <div className="space-y-6">
      {/* Generator Button or Story Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-6 rounded-lg border border-purple-500/20 bg-background/30 backdrop-blur-sm overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{ backgroundSize: '200% 200%' }}
        />

        <div className="relative flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              {savedStory ? 'Your Epic Tale' : 'Ready to Generate Your Epic Tale'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {savedStory 
                ? 'Your story has been woven from your quests'
                : `Transform your ${activeTasks.length} quest${activeTasks.length !== 1 ? 's' : ''} into an epic story`
              }
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedStory && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClearStory}
                className="p-2 rounded-lg text-muted-foreground hover:text-pink-500 transition-colors"
                title="Clear story"
              >
                <Trash2 className="w-5 h-5" />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateStory}
              disabled={isGenerating || activeTasks.length === 0}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : savedStory ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Regenerate Tale
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Epic Tale
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Task count indicator */}
        {!savedStory && activeTasks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2"
          >
            <div className="flex-1 h-1 bg-purple-500/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{ 
                  width: `${Math.min(100, (activeTasks.length / 3) * 100)}%`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (activeTasks.length / 3) * 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {activeTasks.length} {activeTasks.length === 1 ? 'quest' : 'quests'} ready
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Oracle Animation */}
      <AnimatePresence>
        {isGenerating && <OracleAnimation />}
      </AnimatePresence>

      {/* Generated Story Display */}
      <AnimatePresence mode="wait">
        {savedStory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative rounded-lg border border-purple-500/20 bg-background/30 backdrop-blur-sm overflow-hidden"
          >
            {/* Story Header */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="p-6 cursor-pointer"
              onClick={() => setShowStory(!showStory)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {savedStory.title}
                </h3>
                {showStory ? (
                  <ChevronUp className="w-5 h-5 text-purple-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-purple-500" />
                )}
              </div>
            </motion.div>

            {/* Story Content */}
            <AnimatePresence mode="wait">
              {showStory && storyContent}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-500"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 