import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Title } from "@shared/components/title/title";
import { GalleryService } from "@shared/services/gallery.service";
import { GalleryType } from "@shared/types/GalleryType";

@Component({
    selector: "main-gallery",
    imports: [Button, Title, CommonModule],
    templateUrl: "./gallery.html",
    styleUrl: "./gallery.css",
})
export class Gallery implements OnInit {
    protected gallery: WritableSignal<GalleryType[]> = signal<GalleryType[]>([]);
    protected galleryTotal: WritableSignal<number> = signal<number>(0);

    protected currentIndex: WritableSignal<number> = signal<number>(1);

    protected isTransitioning: WritableSignal<boolean> = signal<boolean>(false);
    protected isTransitionEnabled: WritableSignal<boolean> = signal<boolean>(true);
    private autoplayInterval: ReturnType<typeof setInterval> | null = null;
    private autoplayTimeout: ReturnType<typeof setTimeout> | null = null;

    private galleryService: GalleryService = inject(GalleryService);

    ngOnInit(): void {
        this.loadGallery();

        this.startAutoPlay();
    }

    private loadGallery(): void {
        this.galleryService.getGallery().then((response: GalleryType[]) => {
            if (response.length > 1) {
                const first = {
                    ...response[0],
                    id: response[0].id + "_cloned",
                };
                const last = {
                    ...response[response.length - 1],
                    id: response[response.length - 1].id + "_cloned",
                };

                this.gallery.set([last, ...response, first]);
            } else {
                this.gallery.set(response);
            }

            this.galleryTotal.set(response.length);
        });
    }

    protected nextGalleryPage(isUserIteraction: boolean): void {
        if (this.isTransitioning()) {
            return;
        }

        this.currentIndex.update((i) => i + 1);

        this.isTransitioning.set(true);
        this.isTransitionEnabled.set(true);

        if (isUserIteraction) {
            this.onUserInteraction();
        }
    }

    protected prevGalleryPage(isUserIteraction: boolean): void {
        if (this.isTransitioning()) {
            return;
        }

        this.currentIndex.update((i) => i - 1);

        this.isTransitioning.set(true);
        this.isTransitionEnabled.set(true);

        if (isUserIteraction) {
            this.onUserInteraction();
        }
    }

    protected startAutoPlay(): void {
        if (!this.autoplayTimeout && !this.autoplayInterval) {
            this.autoplayInterval = setInterval(() => this.nextGalleryPage(false), 4000);
        }
    }

    protected stopAutoPlay(): void {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }

        if (this.autoplayTimeout) {
            clearTimeout(this.autoplayTimeout);
            this.autoplayTimeout = null;
        }
    }

    private onUserInteraction(): void {
        this.stopAutoPlay();

        if (this.autoplayTimeout) {
            clearTimeout(this.autoplayTimeout);
            this.autoplayTimeout = null;
        }

        this.autoplayTimeout = setTimeout(() => {
            this.autoplayTimeout = null;
            this.startAutoPlay();
        }, 6000);
    }

    protected onTransitionEnd(): void {
        this.isTransitioning.set(false);

        if (this.currentIndex() === this.galleryTotal() + 1) {
            this.isTransitionEnabled.set(false);
            this.currentIndex.set(1);
        } else if (this.currentIndex() === 0) {
            this.isTransitionEnabled.set(false);
            this.currentIndex.set(this.galleryTotal());
        }
    }
}
