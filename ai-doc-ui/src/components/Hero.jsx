export default function Hero() {
  return (
    <section className="text-center py-12 sm:py-20">
      <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium tracking-wide">
        <span className="text-base">👋</span> Welcome to your digital clinic
      </div>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-stone-800 tracking-tight mb-6">
        How are you feeling today?
      </h1>
      <p className="max-w-2xl mx-auto text-lg sm:text-xl text-stone-600 leading-relaxed px-4">
        Whether you have a quick question about a symptom or need to check a skin concern, we are here to help guide you.
      </p>
    </section>
  );
}
