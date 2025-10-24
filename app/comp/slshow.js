import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import '../../style/slshow.css'; // Adjust path to your CSS file

const Slideshow = () => {
  const images = [
    '/straight.webp',
    '/cargo.webp',
    '/bootcut.webp',
  ]; // Define your specific images here

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length > 1) {
      const timer = setInterval(() => {
        setActiveIndex(prevIndex => (prevIndex + 1) % images.length);
      }, 5000); // 5000ms or 5 seconds interval for slideshow

      return () => {
        clearInterval(timer);
      };
    }
  }, [images]);

  const handleSlideChange = index => {
    setActiveIndex(index);
  };

  return (
    <div className="slideshow-container">
      {images.map((image, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className={`slide ${index === activeIndex ? 'active' : ''}`}
        >
          <img className="display" src={image} alt={`Slide ${index}`} />

          <div className="slideshow__nav container">
            {images.map((_, idx) => (
              <button
                key={idx}
                className={`slideshow__progress-bar ${
                  idx === activeIndex ? 'active' : ''
                }`}
                aria-controls={`slideshow-image-${idx + 1}`}
                aria-current={idx === activeIndex ? 'true' : 'false'}
                onClick={() => handleSlideChange(idx)}
              >
                <span className="visually-hidden">{`Go to slide ${
                  idx + 1
                }`}</span>
              </button>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Slideshow;
