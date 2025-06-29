import React from 'react';

const VideoSection: React.FC = () => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              className="w-full h-96"
              src="https://www.youtube.com/embed/NF2lGpFjJ7Q"
              title ="ToTo Law Introduction Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default VideoSection;