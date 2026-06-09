'use client';

// Mentor Page component

import React, { useState } from 'react';
import { MentorChat } from './MentorChat';

interface MentorPageProps {
  userId?: string;
}

export function MentorPage({ userId }: MentorPageProps) {
  const [showChat, setShowChat] = useState(false);
  const [userContext, setUserContext] = useState<{
    name?: string;
    birthDate?: string;
  }>({});

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Akasha Mentor</h1>
          <p className="text-muted-foreground">
            Your spiritual guide through the ancient paths
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!showChat ? (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold">Begin Your Journey</h2>
              <p className="text-muted-foreground">
                Connect with the wisdom of multiple oracular systems:
                Cabala, Astrology, Ifá/Odus, and Tantra.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userContext.name || ''}
                  onChange={e => setUserContext(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Birth Date
                </label>
                <input
                  type="date"
                  value={userContext.birthDate || ''}
                  onChange={e => setUserContext(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <button
                onClick={() => setShowChat(true)}
                className="w-full py-3 bg-primary text-white rounded-lg font-medium"
              >
                Start Chatting
              </button>
            </div>
          </div>
        ) : (
          <div className="h-[calc(100vh-200px)]">
            <MentorChat userId={userId} initialContext={userContext} />
          </div>
        )}
      </main>
    </div>
  );
}
