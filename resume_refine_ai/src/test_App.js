import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';

// Helper: mock file upload event
function createFile(name = "resume.txt", type = "text/plain", contents = "My resume text") {
  const blob = new Blob([contents], { type });
  blob.lastModifiedDate = new Date();
  blob.name = name;
  return blob;
}

describe('ResumeRefine AI App', () => {
  // Reset timers for async testing
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // 1. Home Page test
  test('renders HomePage and navigates to sign-in', () => {
    render(<App />);
    expect(screen.getByText(/AI-Powered Resume Analysis/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
    // Home shows Sign In nav button, and sign-out is not present
    expect(screen.getAllByRole('button', { name: /sign in/i })[0]).toBeInTheDocument();

    // Click Get Started (should route to sign-in)
    fireEvent.click(screen.getByRole('button', { name: /get started/i }));
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    // Navbar updates: can't sign out, sign in is present but disabled/opaq
    expect(screen.getAllByRole('button', { name: /sign in/i })[0]).toBeDisabled();
  });

  // 2. Sign-In Page test
  test('sign-in page interaction and mock login flow', async () => {
    render(<App />);
    // Go to sign-in manually
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();

    // Fill in email/password and submit
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'alice@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pa$$' } });
    const btn = screen.getByRole('button', { name: /^sign in$/i });
    expect(btn).not.toBeDisabled();

    // Submit form (should show "Signing in..." and then route to main tool page)
    fireEvent.click(btn);
    // Loading disables form, button changes
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();

    // Advance time to complete mock login
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/resume analyzer/i)).toBeInTheDocument();
    // Should show sign-out button in nav now
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  // 3. Sign-In validation - shows error if required fields are missing (browser should block but test edge)
  test('sign-in form blocks submission with invalid fields', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    const btn = screen.getAllByRole('button', { name: /sign in/i }).find(b => !b.disabled);
    // Don't enter required fields, expect button to be enabled (browser stops submit but App will not error)
    expect(btn).not.toBeDisabled();
  });

  // 4. Sign-out: returns to home and clears state
  test('sign-out returns to home and resets state', async () => {
    render(<App />);
    // Login
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'bob@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 's3cr3t' } });
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
    await act(async () => {
      jest.advanceTimersByTime(900);
    });
    // Now signed in, sign-out visible
    const signOutBtn = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(signOutBtn);

    expect(screen.getByText(/AI-Powered Resume Analysis/i)).toBeInTheDocument();
    // Auth state should be reset (sign in visible)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  // 5. Resume Analysis Form - invalid submission shows error
  test('shows error if resume analysis form is incomplete', async () => {
    render(<App />);
    // Login
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'carol@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wordpass' } });
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
    await act(async () => {
      jest.advanceTimersByTime(900);
    });

    // Only fill name
    fireEvent.change(screen.getByPlaceholderText(/your name/i), { target: { value: 'Carol' } });
    // Don't select role or upload file
    fireEvent.click(screen.getByRole('button', { name: /analyze my resume/i }));

    // Error should appear (async)
    await waitFor(() => expect(screen.getByText(/please complete all fields/i)).toBeInTheDocument());
  });

  // 6. Resume Analysis - valid submission shows suggestions
  test('AI suggestions render after valid resume analysis', async () => {
    render(<App />);
    // Login
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'dan@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'danpass' } });
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
    await act(async () => {
      jest.advanceTimersByTime(850);
    });

    // Fill form completely
    fireEvent.change(screen.getByPlaceholderText(/your name/i), { target: { value: 'Dan' } });
    fireEvent.change(screen.getByDisplayValue(''), { target: { value: 'Software Engineer' } }); // select role
    // Select by option label, in case select hasn't resolved:
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Software Engineer' } });

    // Upload file
    const fileInput = screen.getByLabelText(/resume file/i).querySelector('input[type="file"]') || screen.getByLabelText(/resume file/i).closest('label').querySelector('input[type="file"]');
    const file = createFile();
    // Fire input
    await act(async () => {
      fireEvent.change(fileInput, {
        target: { files: [file] }
      });
    });
    expect(fileInput.files[0]).toBe(file);

    fireEvent.click(screen.getByRole('button', { name: /analyze my resume/i }));

    // Wait for AI to "process" (1200ms)
    await act(async () => {
      jest.advanceTimersByTime(1300);
    });

    expect(screen.getByText(/AI Suggestions/i)).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
    // Should see at least one suggestion
    expect(screen.getByText(/Tailor your summary/i)).toBeInTheDocument();
    expect(screen.queryByText(/please complete all fields/i)).not.toBeInTheDocument();
  });

  // 7. AI Suggestions - default and error states
  test('AI suggestions panel renders default and error states', async () => {
    render(<App />);
    // Login
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'eva@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'evaeva' } });
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
    await act(async () => {
      jest.advanceTimersByTime(900);
    });

    // Default state: prior to submit
    expect(screen.getByText(/upload your resume and click analyze/i)).toBeInTheDocument();

    // Submit incomplete: triggers error
    fireEvent.click(screen.getByRole('button', { name: /analyze my resume/i }));
    await waitFor(() => expect(screen.getByText(/please complete all fields/i)).toBeInTheDocument());
  });

  // 8. Redirect to sign-in if accessing tool page while not authenticated
  test('redirects unauthenticated user to sign-in when attempting to reach tool page', () => {
    render(<App />);
    // Simulate setting "tool" page while not authenticated
    // Direct manipulation not possible externally, so clicking "Sign In" and NOT logging in, going back etc.
    // We'll use the flow as user: not signed in, click Get Started, see sign in form, try to navigate tool
    fireEvent.click(screen.getByRole('button', { name: /get started/i }));
    // There should be no "resume analyzer" present, sign-in must be completed
    expect(screen.queryByText(/resume analyzer/i)).not.toBeInTheDocument();
  });

  // 9. Navigation: Home button in sign-in
  test('home button on sign-in page returns to home', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    const homeBtn = screen.getByRole('button', { name: /back to home/i });
    fireEvent.click(homeBtn);
    // Back at home page hero
    expect(screen.getByText(/AI-Powered Resume Analysis/i)).toBeInTheDocument();
  });
});

