import { render, screen, fireEvent } from '@testing-library/react';
import ChatButton from './ChatButton';

describe('ChatButton', () => {
  it('renders correctly', () => {
    const mockOnClick = jest.fn();
    render(<ChatButton onClick={mockOnClick} />);

    // Check if the button is rendered with the correct aria-label
    const button = screen.getByRole('button', { name: /open chat with support/i });
    expect(button).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const mockOnClick = jest.fn();
    render(<ChatButton onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: /open chat with support/i });
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Enter key is pressed', () => {
    const mockOnClick = jest.fn();
    render(<ChatButton onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: /open chat with support/i });
    fireEvent.keyDown(button, { key: 'Enter' });

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Space key is pressed', () => {
    const mockOnClick = jest.fn();
    render(<ChatButton onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: /open chat with support/i });
    fireEvent.keyDown(button, { key: ' ' });

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
