// __tests__/Home.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '../app/page';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
    };
  },
}));

// Mock Firebase
jest.mock('../app/firebase/config', () => ({
  auth: {
    onAuthStateChanged: jest.fn((callback) => {
      // Simulate not logged in
      callback(null);
      return () => {}; // Return an unsubscribe function
    }),
  },
  db: {},
  googleProvider: {},
}));

describe('Home', () => {
  it('renders a heading', () => {
    render(<Home />);

    const heading = screen.getByRole('heading', {
      name: /Kansha AI/i,
    });

    expect(heading).toBeInTheDocument();
  });

  it('renders a sign in button when not logged in', async () => {
    render(<Home />);

    // Wait for the loading state to settle
    await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument());

    const signInButton = screen.getByRole('button', {
      name: /Sign in with Google/i,
    });

    expect(signInButton).toBeInTheDocument();
  });
});
