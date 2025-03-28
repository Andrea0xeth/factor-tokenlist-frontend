import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TokenImage from './TokenImage';

describe('TokenImage', () => {
  // Test di rendering base
  it('renders correctly with basic props', () => {
    render(<TokenImage alt="ETH" src="https://example.com/eth.png" />);
    
    // Verifica che l'elemento img sia presente
    const imgElement = screen.getByAltText('ETH');
    expect(imgElement).toBeInTheDocument();
  });

  // Test di fallback quando l'src è vuoto
  it('renders with placeholder when src is empty', () => {
    render(<TokenImage alt="BTC" />);
    
    // Verifica che sia comunque presente un'immagine con alt text
    const imgElement = screen.getByAltText('BTC');
    expect(imgElement).toBeInTheDocument();
    
    // Verifica che sia presente un elemento con le iniziali
    const container = screen.getByTestId('token-image');
    expect(container).toBeInTheDocument();
  });

  // Test con dimensioni personalizzate
  it('applies custom size', () => {
    const customSize = 48;
    render(<TokenImage alt="USDC" size={customSize} />);
    
    const container = screen.getByTestId('token-image');
    
    // Verifica che le dimensioni siano applicate correttamente
    expect(container).toHaveStyle({
      width: `${customSize}px`,
      height: `${customSize}px`,
    });
  });

  // Test con classe personalizzata
  it('applies custom className', () => {
    const customClass = 'test-class';
    render(<TokenImage alt="USDT" className={customClass} />);
    
    const container = screen.getByTestId('token-image');
    expect(container).toHaveClass(customClass);
  });

  // Test con indirizzo del token
  it('handles token address correctly', () => {
    const address = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // DAI address
    render(<TokenImage alt="DAI" address={address} />);
    
    // Verifica che l'immagine sia presente
    const imgElement = screen.getByAltText('DAI');
    expect(imgElement).toBeInTheDocument();
  });
}); 