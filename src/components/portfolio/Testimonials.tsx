import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote:
      "Delivered a complex dashboard on time with clean code and great documentation. Would work with again.",
    name: "Sarah Chen",
    role: "Product Lead, Tech Co.",
  },
  {
    quote:
      "Strong problem-solver and communicator. Brought our frontend stack up to date and improved performance noticeably.",
    name: "James Park",
    role: "CTO, Startup Labs",
  },
  {
    quote:
      "Professional, responsive, and technically sharp. The API and admin panel he built are still running smoothly after 2 years.",
    name: "Maria Lopez",
    role: "Founder, Digital Agency",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative border-t border-border bg-card/30 py-20 md:py-28"
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <h2
          id="testimonials-heading"
          className="section-reveal mb-4 text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          data-section-reveal
        >
          What People Say
        </h2>
        <p
          className="section-reveal mx-auto mb-12 max-w-2xl text-center text-muted-foreground"
          data-section-reveal
        >
          Feedback from clients and collaborators.
        </p>

        <div className="section-reveal" data-section-reveal>
          <Carousel
            opts={{ align: "start", loop: true }}
            className="mx-auto w-full max-w-2xl"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((t) => (
                <CarouselItem key={t.name} className="pl-2 md:pl-4">
                  <div
                    className={cn(
                      "rounded-2xl border border-border bg-card/80 p-6 shadow-lg",
                      "card-hover-lift"
                    )}
                  >
                    <blockquote className="text-lg leading-relaxed text-foreground md:text-xl">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <footer className="mt-4">
                      <cite className="not-italic">
                        <span className="font-semibold text-foreground">
                          {t.name}
                        </span>
                        <span className="text-muted-foreground"> — {t.role}</span>
                      </cite>
                    </footer>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-2 border-border bg-card/80 text-foreground hover:bg-card md:-left-12" />
            <CarouselNext className="-right-2 border-border bg-card/80 text-foreground hover:bg-card md:-right-12" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
