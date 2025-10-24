import React, { useState } from 'react';
import '../../style/size.css'; // Import the CSS file

const SizeSelection = () => {
  // State to manage the selected size
  const [selectedSize, setSelectedSize] = useState('');

  // Function to handle size selection
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  return (
    <div className="size-selection">
      <p className='ptag'>Select Size</p>
      <div className="sies">
        <button 
          className={`size-button ${selectedSize === '28' ? 'selected' : ''}`}
          onClick={() => handleSizeSelect('28')}
        >
          28
        </button>
        <button 
          className={`size-button ${selectedSize === '30' ? 'selected' : ''}`}
          onClick={() => handleSizeSelect('30')}
        >
          30
        </button>
        <button 
          className={`size-button ${selectedSize === '32' ? 'selected' : ''}`}
          onClick={() => handleSizeSelect('32')}
        >
          32
        </button>
        <button 
          className={`size-button ${selectedSize === '34' ? 'selected' : ''}`}
          onClick={() => handleSizeSelect('34')}
        >
          34
        </button>
        <button 
          className={`size-button ${selectedSize === '36' ? 'selected' : ''}`}
          onClick={() => handleSizeSelect('36')}
        >
          36
        </button>
        {/* Add more size buttons as needed */}
      </div>
    </div>
  );
};

export default SizeSelection;
