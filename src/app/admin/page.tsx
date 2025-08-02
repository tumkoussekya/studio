
'use client';

import React from 'react';

export default function AdminPage() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold">Administrator Panel</h1>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <p className="text-muted-foreground">User and team management coming soon...</p>
      </main>
    </div>
  );
}
