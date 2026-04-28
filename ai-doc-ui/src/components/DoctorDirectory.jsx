import { useState } from 'react';
import { Star, Briefcase, X, CalendarCheck, ChevronDown } from 'lucide-react';

// ── Mock Doctor Data ────────────────────────────────────────────────────────
const DOCTORS = [
  {
    id: 1,
    name: 'Dr. Priya Sharma',
    specialty: 'Cardiologist',
    experience: 15,
    rating: 4.9,
    reviews: 312,
    bio: 'Specialises in preventive cardiology and heart failure management. Former fellow at AIIMS Delhi.',
    available: ['Mon', 'Wed', 'Fri'],
    image: 'https://i.pravatar.cc/150?img=47',
    color: 'bg-rose-50 border-rose-100',
    badge: 'bg-rose-100 text-rose-700',
  },
  {
    id: 2,
    name: 'Dr. Arjun Patel',
    specialty: 'General Physician',
    experience: 8,
    rating: 4.7,
    reviews: 198,
    bio: 'Family medicine expert focused on holistic wellness, chronic disease management, and preventive care.',
    available: ['Mon', 'Tue', 'Thu', 'Sat'],
    image: 'https://i.pravatar.cc/150?img=68',
    color: 'bg-teal-50 border-teal-100',
    badge: 'bg-teal-100 text-teal-700',
  },
  {
    id: 3,
    name: 'Dr. Riya Kapoor',
    specialty: 'Dermatologist',
    experience: 10,
    rating: 4.8,
    reviews: 245,
    bio: 'Expert in medical and cosmetic dermatology. Specialises in acne, eczema, and skin cancer screening.',
    available: ['Tue', 'Thu', 'Sat'],
    image: 'https://i.pravatar.cc/150?img=44',
    color: 'bg-purple-50 border-purple-100',
    badge: 'bg-purple-100 text-purple-700',
  },
  {
    id: 4,
    name: 'Dr. Mohit Singh',
    specialty: 'Neurologist',
    experience: 12,
    rating: 4.6,
    reviews: 167,
    bio: 'Skilled in diagnosing and treating migraines, epilepsy, Parkinson\'s disease, and stroke rehabilitation.',
    available: ['Mon', 'Wed', 'Sat'],
    image: 'https://i.pravatar.cc/150?img=60',
    color: 'bg-blue-50 border-blue-100',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    id: 5,
    name: 'Dr. Ananya Mehta',
    specialty: 'Gynaecologist',
    experience: 9,
    rating: 4.8,
    reviews: 289,
    bio: 'Compassionate women\'s health specialist covering prenatal care, fertility, and menopause management.',
    available: ['Tue', 'Thu', 'Fri'],
    image: 'https://i.pravatar.cc/150?img=49',
    color: 'bg-amber-50 border-amber-100',
    badge: 'bg-amber-100 text-amber-700',
  },
];

const SPECIALTIES = ['All', ...new Set(DOCTORS.map((d) => d.specialty))];

// ── Time slots ────────────────────────────────────────────────────────────
const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:30 PM'];

// ── Rating stars ───────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${
            s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200'
          }`}
        />
      ))}
      <span className="text-sm font-semibold text-stone-700 ml-1">{rating}</span>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function DoctorDirectory() {
  const [filter, setFilter] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [toast, setToast] = useState(false);

  const filtered = filter === 'All' ? DOCTORS : DOCTORS.filter((d) => d.specialty === filter);

  // Min date = today
  const today = new Date().toISOString().split('T')[0];

  const handleBook = () => {
    if (!selectedDate || !selectedTime) return;
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime('');
    setToast(true);
    setTimeout(() => setToast(false), 4000);
  };

  return (
    <div className="space-y-8 relative">

      {/* ── Success Toast ── */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 bg-teal-600 text-white rounded-full shadow-xl text-base font-medium animate-bounce">
          <CalendarCheck className="w-5 h-5" />
          Appointment Booked Successfully! 🎉
        </div>
      )}

      {/* ── Header + Filter ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Find a Doctor</h2>
          <p className="text-stone-500 text-sm mt-1">Browse our verified specialists and book a consultation</p>
        </div>

        {/* Specialty filter dropdown */}
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-3 bg-white border border-stone-200 rounded-full text-sm font-medium text-stone-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 cursor-pointer"
          >
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>{s === 'All' ? '🏥 All Specialties' : s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        </div>
      </div>

      {/* ── Doctor Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            className={`rounded-[2rem] border p-6 flex flex-col gap-4 transition-shadow hover:shadow-md ${doc.color}`}
          >
            {/* Top row */}
            <div className="flex items-start gap-4">
              <img
                src={doc.image}
                alt={doc.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-sm flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-stone-800 text-base leading-snug">{doc.name}</h3>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${doc.badge}`}>
                  {doc.specialty}
                </span>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between text-sm">
              <Stars rating={doc.rating} />
              <span className="text-stone-400 text-xs">{doc.reviews} reviews</span>
            </div>

            {/* Bio */}
            <p className="text-stone-600 text-sm leading-relaxed line-clamp-3">{doc.bio}</p>

            {/* Experience + Available days */}
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                {doc.experience} yrs experience
              </span>
              <span>{doc.available.join(' · ')}</span>
            </div>

            {/* Book button */}
            <button
              onClick={() => setSelectedDoctor(doc)}
              className="mt-auto w-full py-3 bg-white border border-stone-200 text-stone-700 font-semibold text-sm rounded-2xl hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-all shadow-sm"
            >
              📅 Book Appointment
            </button>
          </div>
        ))}
      </div>

      {/* ── Booking Modal ── */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSelectedDoctor(null)}
          />

          {/* Modal card */}
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 z-50 flex flex-col gap-6">

            {/* Close button */}
            <button
              onClick={() => setSelectedDoctor(null)}
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Doctor info in modal */}
            <div className="flex items-center gap-4">
              <img
                src={selectedDoctor.image}
                alt={selectedDoctor.name}
                className="w-14 h-14 rounded-full object-cover border-4 border-stone-100 shadow"
              />
              <div>
                <h3 className="font-bold text-stone-800 text-lg">{selectedDoctor.name}</h3>
                <p className="text-stone-500 text-sm">{selectedDoctor.specialty}</p>
              </div>
            </div>

            <hr className="border-stone-100" />

            {/* Date picker */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-stone-700">📅 Select Date</label>
              <input
                type="date"
                min={today}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all"
              />
            </div>

            {/* Time slot picker */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-stone-700">🕐 Select Time Slot</label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2.5 rounded-2xl text-sm font-medium border transition-all ${
                      selectedTime === slot
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-teal-300 hover:bg-teal-50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm button */}
            <button
              onClick={handleBook}
              disabled={!selectedDate || !selectedTime}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold text-base rounded-full transition-all shadow-sm"
            >
              Confirm Appointment
            </button>

            <p className="text-center text-xs text-stone-400">
              This is a mock booking for demonstration purposes only.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
