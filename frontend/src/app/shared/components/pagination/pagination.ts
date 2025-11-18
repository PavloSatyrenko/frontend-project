import { CommonModule } from "@angular/common";
import { Component, computed, effect, EventEmitter, input, InputSignal, output, Output, OutputEmitterRef, Signal, signal, WritableSignal } from "@angular/core";

@Component({
    selector: "ui-pagination",
    imports: [CommonModule],
    templateUrl: "./pagination.html",
    styleUrl: "./pagination.css"
})
export class Pagination {
    public readonly pageAmount: InputSignal<number> = input<number>(0);
    public readonly middlePagesAmount: InputSignal<number> = input<number>(3);

    public readonly currentPage: WritableSignal<number> = signal<number>(1);

    protected readonly middlePages: Signal<number[]> = computed<number[]>(() => {
        if (this.middlePagesAmount() < this.pageAmount() - 2) {
            const pages: number[] = [];
            let startPage: number = this.currentPage() - Math.floor(this.middlePagesAmount() / 2);
            let endPage: number = 0;

            if (startPage < 2) {
                startPage = 2;
            }
            else if (startPage + this.middlePagesAmount() > this.pageAmount()) {
                startPage = this.pageAmount() - this.middlePagesAmount();
            }

            endPage = startPage + this.middlePagesAmount() - 1;

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            return pages;
        }
        else {
            return Array.from({ length: this.pageAmount() - 2 }, (_, i) => i + 2);
        }
    });

    public readonly pageChange: OutputEmitterRef<number> = output<number>();

    constructor() {
        effect(() => {
            this.pageAmount();
            this.currentPage.set(1);
        })
    }

    public nextPage(): void {
        if (this.currentPage() < this.pageAmount()) {
            this.currentPage.set(this.currentPage() + 1);
            this.pageChange.emit(this.currentPage());
        }
    }

    public previousPage(): void {
        if (this.currentPage() > 1) {
            this.currentPage.set(this.currentPage() - 1);
            this.pageChange.emit(this.currentPage());
        }
    }

    public setPage(page: number): void {
        if (page >= 1 && page <= this.pageAmount() && page !== this.currentPage()) {
            this.currentPage.set(page);
            this.pageChange.emit(this.currentPage());
        }
    }

    protected isShowStartDots(): boolean {
        return (this.pageAmount() > this.middlePagesAmount() + 2
            && this.currentPage() > Math.floor(this.middlePagesAmount() / 2) + (this.middlePagesAmount() % 2 == 0 ? 2 : 1));
    }

    protected isShowEndDots(): boolean {
        return (this.pageAmount() > this.middlePagesAmount() + 2
            && this.currentPage() < this.pageAmount() - Math.floor(this.middlePagesAmount() / 2) - (this.middlePagesAmount() % 2 == 0 ? 0 : 1));
    }

    protected isPageActive(page: number): boolean {
        return this.currentPage() === page;
    }

    protected isPreviousDisabled(): boolean {
        return this.currentPage() <= 1;
    }

    protected isNextDisabled(): boolean {
        return this.currentPage() >= this.pageAmount();
    }
}
