import { DatePipe } from '@angular/common';
import { Component, inject, LOCALE_ID, OnInit, signal, WritableSignal } from '@angular/core';
import { Button } from '@shared/components/button/button';
import { Title } from '@shared/components/title/title';
import { MessageService } from '@shared/services/message.service';
import { VinService } from '@shared/services/vin.service';
import { VinType } from '@shared/types/VinType';

@Component({
    selector: 'app-vin',
    imports: [Button, Title, DatePipe],
    providers: [{ provide: LOCALE_ID, useValue: 'uk-UA' }],
    templateUrl: './vin.html',
    styleUrl: './vin.css'
})
export class Vin implements OnInit {
    protected requests: WritableSignal<VinType[]> = signal<VinType[]>([]);

    protected isShowMoreButtonVisible: WritableSignal<boolean> = signal<boolean>(false);

    private messageService: MessageService = inject(MessageService);
    private vinService: VinService = inject(VinService);

    ngOnInit(): void {
        this.loadRequests(false);
    }

    loadRequests(doShowPrevious: boolean): void {
        this.vinService.getAllRequests()
            .then((requestsRes: VinType[]) => {
                if (doShowPrevious) {
                    this.requests.update((requests: VinType[]) => [
                        ...requests,
                        ...requestsRes,
                    ]);
                }
                else {
                    this.requests.set(requestsRes);
                }
            })
            .catch((error) => {
                console.error(error);
                this.messageService.showMessage("error", "Помилка", `Помилка: ${error.error.message ?? error.statusText}`);
            });
    }

    protected showMore(): void {

    }
}
