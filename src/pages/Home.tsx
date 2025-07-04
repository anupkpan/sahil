import React from 'react';
import bg from '../assets/sahil-theme.png';

export default function Home() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-white"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="bg-black bg-opacity-60 min-h-screen flex flex-col items-center justify-center text-center px-6 py-12 space-y-10">
        <h1 className="text-5xl font-bold text-rose-300 drop-shadow-lg">Sahil — साहिल</h1>
        <p className="max-w-2xl text-lg text-gray-300 leading-relaxed">
          चाँदनी रातों का किनारा, जज़्बातों का साहिल।  
          यहाँ शायरी सिर्फ़ पढ़ी नहीं जाती — महसूस की जाती है।
        </p>
        <div className="text-sm text-gray-400 pt-6">~ एक नज़रिया, दिल से</div>
      </div>
    </div>
  );
}
