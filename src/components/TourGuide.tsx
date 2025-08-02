
'use client';

import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface TourGuideProps {
  isAdmin: boolean;
}

export default function TourGuide({ isAdmin }: TourGuideProps) {
  useEffect(() => {
    const hasCompletedTour = localStorage.getItem('syncrospace_tour_completed');

    if (hasCompletedTour) {
      return;
    }

    const steps = [
      {
        element: '#tour-welcome',
        popover: {
          title: 'Welcome to SyncroSpace!',
          description: 'This is your dashboard, your central hub for collaboration. Let\'s take a quick tour.',
          side: "bottom",
          align: 'start',
        },
      },
      {
        element: '#tour-world',
        popover: {
          title: 'Enter the World',
          description: 'This is the heart of SyncroSpace. Jump into the 2D virtual office to interact with your team.',
          side: "bottom",
          align: 'start',
        },
      },
      {
        element: '#tour-chat',
        popover: {
          title: 'Team Chat',
          description: 'Access all your direct messages and team channels here for real-time text communication.',
          side: "bottom",
          align: 'start',
        },
      },
    ];

    if (isAdmin) {
      steps.push({
        element: '#tour-admin',
        popover: {
          title: 'Admin Panel',
          description: 'Since you\'re an admin, you can manage users, view analytics, and access other administrative tools from here.',
          side: "top",
          align: 'start',
        },
      });
    }

    steps.push({
        element: '#tour-header-buttons',
        popover: {
          title: 'Settings & Logout',
          description: 'You can toggle the theme and log out from your account here. Enjoy exploring SyncroSpace!',
          side: "bottom",
          align: 'end',
        },
      });

    const driverObj = driver({
      showProgress: true,
      steps: steps,
      onDestroyStarted: () => {
        localStorage.setItem('syncrospace_tour_completed', 'true');
        driverObj.destroy();
      },
    });

    driverObj.drive();

  }, [isAdmin]);

  return null;
}
