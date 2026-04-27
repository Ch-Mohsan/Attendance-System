import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-orange-600 animate-fade-in">
      <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-10 max-w-xl text-center">
        <h1 className="text-4xl font-extrabold text-black mb-4">Welcome to <span className="text-orange-500">ThinkCode</span> Attendance</h1>
        <p className="text-lg text-gray-700 mb-8">Effortlessly manage your team and attendance with a modern, secure platform for software houses and students.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signUp" className="px-8 py-3 bg-orange-500 text-white font-bold rounded shadow hover:bg-black hover:text-orange-500 transition text-lg">Get Started</Link>
          <Link to="/login" className="px-8 py-3 bg-black text-orange-500 font-bold rounded shadow hover:bg-orange-500 hover:text-white transition text-lg">Login</Link>
        </div>
      </div>
    </div>
  );
}