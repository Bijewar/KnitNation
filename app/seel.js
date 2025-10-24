import React, { useState, useEffect } from 'react';
import '../style/seel.css'; // Ensure this path is correct

const Slideshow = () => {
  const imageFames = ['straight', 'bootcut', 'cargo'];
  const [activeSlider, setActiveSlider] = useState(0);
  const slideshowDurations = 5000; // Duration in milliseconds

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlider((prev) => (prev + 1) % imageFames.length);
    }, slideshowDurations)

    return () => clearInterval(interval);
  }, [imageFames.length, slideshowDurations]);

  console.log(`Rendering slide: ${imageFames[activeSlider]}`);

  return (
    <div className="new-slideshow-container">
      {imageFames.map((imageName, index) => (
        <div key={index} className={`new-slide ${index === activeSlider ? 'visible' : 'hidden'}`}>
          <img className="new-display" src={`/${imageName}.webp`} alt={imageName} />
          <div className="new-timer-container">
      {imageFames.map((_, timerIndex) => (
        <div
          key={timerIndex}
          className={`new-timer new-timer${timerIndex + 1} ${timerIndex === activeSlider ? 'new-active' : ''}`}
          style={{
            '--slideshow-duration': `${slideshowDurations}ms`,
            '--animation-delay': `${timerIndex === activeSlider ? 0 : slideshowDurations + 500}ms`,
            '--transition-delay': `${timerIndex === activeSlider ? slideshowDurations + 500 : 0}ms`,
            '--animation-play-state': `${timerIndex === activeSlider ? 'running' : 'paused'}`,
          }}
        />
      ))}
      </div>
        </div>
      ))}
    </div>
  );
};

export default Slideshow;
