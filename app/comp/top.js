import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../../style/top.css';

const images = [
  '/c1.webp',
  '/c2.webp',
  '/c3.webp',
  '/c4.webp',
  '/c5.webp',
  '/c6.webp',
];

const settings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
      },
    },
  ],
};

const TopCategories = () => {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const sliderRef = React.useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const nextSlide = () => {
    sliderRef.current.slickNext();
  };
  const prevSlide = () => {
    sliderRef.current.slickPrev();
  };

  const handleSlideClick = (index) => {
    if (index === 0) {
      console.log('Attempting to redirect to jeans category');
      router.push('/collection/jeans');
    } else {
      console.log(`No specific action for slide at index ${index}`);
    }
  };

  if (!isMounted) {
    return null; // Prevent rendering on server
  }

  return (
    <div className="carousel-container">
      <button className="carousel-button left" onClick={prevSlide} aria-label="Previous categories">
        <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
          <path d="M7 1L1.5 6L7 11" stroke="#282c3f" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <Slider ref={sliderRef} {...settings}>
        {images.map((image, index) => (
          <div
            key={index}
            className="carousel-image"
            onClick={() => handleSlideClick(index)}
            style={{ cursor: 'pointer' }}
          >
            <div className="carousel-tile">
              <img src={image} alt={`Category ${index + 1}`} className="carousel-photo" />
              <div className="carousel-tile-overlay">
                <span>Shop Now</span>
              </div>
            </div>
          </div>
        ))}
      </Slider>
      <button className="carousel-button right" onClick={nextSlide} aria-label="Next categories">
        <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
          <path d="M1 1L6.5 6L1 11" stroke="#282c3f" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};

export default TopCategories;
