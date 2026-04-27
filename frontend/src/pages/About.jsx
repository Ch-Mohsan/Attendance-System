import React from "react";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg animate-fade-in border border-gray-200">
      <h1 className="text-4xl font-extrabold text-black mb-4 text-center tracking-wide">About ThinkCode IT Solutions</h1>
      <p className="text-lg text-gray-700 mb-6 text-center">
        Supercharge your digital presence with <span className="text-orange-500 font-bold">ThinkCode IT Solutions</span>. We design and develop high-performing websites, mobile apps, and custom software tailored to your business needs. Our expert team combines cutting-edge technology with data-driven strategies to enhance your visibility, drive engagement, and accelerate growth.
      </p>
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-orange-500 mb-2">Our Services</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Website Development</li>
            <li>Application Development</li>
            <li>Software Development</li>
            <li>Social Media Marketing</li>
            <li>SEO & Digital Marketing</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-orange-500 mb-2">Why Choose Us?</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Customer-Centric Approach</li>
            <li>Customized Solutions</li>
            <li>Proven Expertise</li>
            <li>Seamless Digital Integration</li>
            <li>Innovative Strategies</li>
            <li>Result-Driven</li>
          </ul>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-orange-500 mb-2">What Our Clients Say</h2>
        <div className="bg-gray-50 rounded-lg p-4 mb-2 shadow-sm">
          <p className="italic text-gray-800">“ThinkCode IT Solutions revamped our website, making it faster and more user-friendly. Our conversion rates improved by 40% within months! Their team is highly professional and committed to excellence.”</p>
          <div className="text-right text-sm text-gray-600 mt-2">— Ali Raza, CEO, Tech Solutions (Pakistan)</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mb-2 shadow-sm">
          <p className="italic text-gray-800">“The digital marketing strategies implemented by ThinkCode helped us gain a 60% increase in organic traffic. Our social media presence is now stronger than ever. Fantastic service!”</p>
          <div className="text-right text-sm text-gray-600 mt-2">— Sophia Carter, Marketing Director, NexaSoft (USA)</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mb-2 shadow-sm">
          <p className="italic text-gray-800">“ThinkCode provided us with a custom-built CRM that streamlined our logistics operations. It has improved our efficiency and customer management significantly.”</p>
          <div className="text-right text-sm text-gray-600 mt-2">— James Robertson, COO, Velocity Logistics (UK)</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mb-2 shadow-sm">
          <p className="italic text-gray-800">“Their SEO expertise got our e-commerce store ranking on the first page of Google within months! The results have been game-changing for our sales.”</p>
          <div className="text-right text-sm text-gray-600 mt-2">— Fatima Noor, E-commerce Owner, TrendHive (UAE)</div>
        </div>
      </div>
      <div className="flex flex-col items-center mt-8">
        <h2 className="text-2xl font-semibold text-orange-500 mb-2">Connect With Us</h2>
        <div className="flex gap-6 mt-2">
          <a href="https://thethinkcode.com/" target="_blank" rel="noopener noreferrer" className="text-black hover:text-orange-500 text-2xl font-bold">Website</a>
          <a href="https://www.facebook.com/thethinkcode" target="_blank" rel="noopener noreferrer" className="text-black hover:text-orange-500 text-2xl font-bold">Facebook</a>
          <a href="https://www.linkedin.com/company/thethinkcode/" target="_blank" rel="noopener noreferrer" className="text-black hover:text-orange-500 text-2xl font-bold">LinkedIn</a>
        </div>
        <div className="text-gray-500 text-sm mt-4">Let's build something amazing together!</div>
      </div>
    </div>
  );
} 