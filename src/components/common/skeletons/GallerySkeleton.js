// GallerySkeleton.js
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const GallerySkeleton = ({ rows = 3, columns = 4 }) => {
  const skeletonItems = [...Array(rows * columns)];

  return (
   <>
      {skeletonItems.map((_, index) => (
        <div className="masonry-item" key={index}>
          <div className="card p-3 position-relative gallery-card">
            <div className="gallery-image-wrapper">
              <Skeleton height={200} width="100%" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default GallerySkeleton;
