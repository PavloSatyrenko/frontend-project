import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageService } from '@shared/services/message.service';

@Component({
	selector: 'ui-message',
	imports: [CommonModule, RouterLink],
	templateUrl: './message.html',
	styleUrl: './message.css'
})
export class Message {
    private messageService = inject(MessageService);

    public readonly header = this.messageService.header;
    public readonly text = this.messageService.text;
    public readonly type = this.messageService.type;
    public readonly isVisible = this.messageService.isVisible;
    public readonly linkText = this.messageService.linkText;
    public readonly linkPath = this.messageService.linkPath;

	hideMessage() {
		this.messageService.hideMessage();
	}
}
