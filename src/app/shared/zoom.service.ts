import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ZoomService {
  private renderer: Renderer2;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initZoom();
    this.listenToRouterEvents();
  }

  private initZoom() {
    // Écouter l'événement de redimensionnement de la fenêtre
    this.renderer.listen('window', 'resize', () => {
      this.adjustZoomResize();
    });

    // Écouter l'événement DOMContentLoaded
    this.renderer.listen(this.document, 'DOMContentLoaded', () => {
      this.adjustZoomResize();
    });

    // Appel initial pour définir le zoom correct
    this.adjustZoomResize();
  }

  private listenToRouterEvents() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.adjustZoomResize();
      }
    });
  }

  public adjustZoomResize() {
    const minWidth = 0;
    const maxWidth = 1400;
    const minZoom = 0;
    const maxZoom = 1.6;
    const windowWidth = window.innerWidth;
    let zoomLevel;

    if (windowWidth < minWidth || windowWidth > maxWidth) {
      zoomLevel = 1.6;
    } else {
      zoomLevel =
        minZoom +
        (maxZoom - minZoom) * ((windowWidth - minWidth) / (maxWidth - minWidth));
    }

    const zoomContainer = this.document.querySelector('.zoom-container');

    if (zoomContainer) {
      this.renderer.setStyle(zoomContainer, 'transform', `scale(${zoomLevel})`);
    }
  }
}
