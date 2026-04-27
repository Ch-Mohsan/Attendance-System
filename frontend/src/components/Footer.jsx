import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white py-4 px-8 flex flex-col md:flex-row items-center justify-between mt-8 shadow-inner border-t border-orange-500">
      <div className="text-lg font-bold text-orange-500">ThinkCode Attendance System</div>
      <div className="text-sm mt-2 md:mt-0">&copy; {new Date().getFullYear()} ThinkCode. All rights reserved.</div>
      <div className="text-xs text-gray-400 mt-1 md:mt-0">Empowering teams with smart attendance tracking.</div>
    </footer>
  );
}