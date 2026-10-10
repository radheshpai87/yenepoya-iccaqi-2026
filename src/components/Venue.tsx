import React from 'react';
import { MapPin, Navigation, Plane, Train, Car } from 'lucide-react';

export const Venue: React.FC = () => {
  return (
    <section id="venue" className="py-20 md:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            Location
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Venue &amp; Location
          </h2>
          <p className="text-sm text-slate-600">
            Yenepoya School of Engineering &amp; Technology, Mangaluru, Karnataka, India
          </p>
        </div>

        {/* Location & Map Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Left: Campus Information */}
          <div className="md:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-100 flex flex-wrap items-center gap-3">
                <img
                  src="/yenepoya-university-logonew3.svg"
                  alt="Yenepoya (Deemed to be University)"
                  className="h-8 w-auto object-contain"
                />
                <div className="h-5 w-[1px] bg-slate-300 hidden sm:block" />
                <img
                  src="/yenepoya-school-engineering-and-technologynew-02.svg"
                  alt="Yenepoya School of Engineering & Technology"
                  className="h-8 w-auto object-contain"
                />
              </div>

              <div className="space-y-1">
                <span className="text-sm sm:text-base font-bold text-slate-900 block">
                  Yenepoya School of Engineering and Technology
                </span>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Yenepoya (Deemed to be University)<br />
                  Yenepoya Complex, Balmatta<br />
                  Mangaluru, Karnataka, India — 575002
                </p>
              </div>

              <div className="pt-2 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Mangaluru Int&apos;l Airport (IXE) — ~14 km</span>
                </div>
                <div className="flex items-center gap-2">
                  <Train className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Mangaluru Central / Junction — ~1.5-3 km</span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Balmatta, Heart of Mangaluru City</span>
                </div>
              </div>
            </div>

            <a
              href="https://maps.app.goo.gl/iZBpz17U1R8eEwQu8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs font-bold bg-[#7cb305] hover:bg-[#689803] text-white shadow-xs transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions on Google Maps</span>
            </a>
          </div>

          {/* Right: Map Embed */}
          <div className="md:col-span-7 h-72 md:h-auto min-h-[300px] rounded-3xl overflow-hidden border border-slate-200 shadow-2xs">
            <iframe
              title="Yenepoya School of Engineering and Technology Campus Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.479261884022!2d74.85108037507484!3d12.87334618742886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba35b2d6f6085d9%3A0xdfeded7e679a3860!2sYenepoya%20School%20of%20Engineering%20%26%20Technology!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
              className="w-full h-full border-0"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>

      </div>
    </section>
  );
};
