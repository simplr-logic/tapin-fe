/**
 * Landing wash palette (Garden tokens):
 *   stop A — canvas      #F8F9F9
 *   stop B — kale-accent #17494D @ ~18%
 *   orb    — link        #1F73B7 @ ~12%
 */
export default function LandingBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="animate-landing-float-slow absolute -top-16 -left-20 w-80 h-80 rounded-full bg-link/12 blur-3xl" />
      <div
        className="animate-landing-float-slow absolute top-10 -right-20 w-96 h-96 rounded-full bg-link/10 blur-3xl"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="animate-landing-float absolute top-112 left-1/4 w-56 h-56 rounded-full bg-kale-accent/10 blur-3xl"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="animate-landing-float-slow absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-link/8 blur-3xl"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="animate-landing-float absolute top-1/2 -left-24 w-64 h-64 rounded-full bg-link/10 blur-3xl"
        style={{ animationDelay: "2.5s" }}
      />
      <div
        className="animate-landing-float-slow absolute bottom-40 right-1/3 w-60 h-60 rounded-full bg-kale/10 blur-3xl"
        style={{ animationDelay: "4s" }}
      />
    </div>
  );
}
