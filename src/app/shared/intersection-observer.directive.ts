import { Directive, ElementRef, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appIntersectionObserver]'
})
export class IntersectionObserverDirective implements OnInit, OnDestroy {
  @Output() isVisible = new EventEmitter<boolean>();

  private observer!: IntersectionObserver;

  constructor(private element: ElementRef) { }

  ngOnInit() {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        this.isVisible.emit(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.1 // Déclenchement lorsque 10% de l'élément est visible
      }
    );

    this.observer.observe(this.element.nativeElement);
  }

  ngOnDestroy() {
    this.observer.unobserve(this.element.nativeElement);
  }
}
