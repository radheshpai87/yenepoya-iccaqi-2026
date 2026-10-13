import React from 'react';
import { MapPin, Navigation, Plane, Train, Car, Hotel, Mail } from 'lucide-react';

export const Venue: React.FC = () => {
  return (
    <section id="venue" className="pt-14 md:pt-16 pb-20 md:pb-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
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

        {/* Mangalore Tourism & Sightseeing Banner */}
        <div className="max-w-lg sm:max-w-xl mx-auto mb-8 sm:mb-10 rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs bg-white transition-all hover:shadow-xs">
          <img
            src="/explore-mangalore-banner.webp"
            alt="Explore the Beauty of Mangalore - Free Sightseeing Facility for Outstation Candidates"
            width={1600}
            height={639}
            loading="lazy"
            decoding="async"
            className="w-full h-auto object-contain block"
          />
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

        {/* Accommodation Facilities Section */}
        <div className="mt-8 sm:mt-10 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <Hotel className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Hospitality &amp; Stay
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Accommodation Facilities
                </h3>
              </div>
            </div>

            <a
              href="mailto:iccaqi2026@yenepoya.edu.in?subject=Accommodation%20Request%20-%20ICCAQI%202026"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-all active:scale-98 self-start sm:self-auto cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>Request Accommodation via Email</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
            {/* Free Accommodation */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col justify-between space-y-2.5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-600 text-white">
                    Complimentary
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Free Accommodation
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Free accommodation is available for a limited number of registered candidates on a <strong className="text-slate-800">first-come, first-served basis</strong>.
                </p>
              </div>
            </div>

            {/* Paid Accommodation */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2.5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-slate-700 text-white">
                    Nominal Charge
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Paid Accommodation
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Candidates who are unable to secure free accommodation may request paid accommodation at a nominal charge by sending an email. <span className="text-slate-500 italic block pt-1">This facility is subject to availability.</span>
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
