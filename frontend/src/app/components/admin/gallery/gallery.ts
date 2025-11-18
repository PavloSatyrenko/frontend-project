import { Component, inject, OnInit, signal, WritableSignal, ElementRef, viewChild, Signal } from "@angular/core";
import { GalleryService } from "@shared/services/gallery.service";
import { GalleryType } from "@shared/types/GalleryType";
import { Button } from "@shared/components/button/button";
import { Select } from "@shared/components/select/select";
import { CommonModule } from "@angular/common";
import { Title } from "@shared/components/title/title";
import { Input } from "@shared/components/input/input";
import { MessageService } from "@shared/services/message.service";
import { Checkbox } from "@shared/components/checkbox/checkbox";

@Component({
    selector: "admin-gallery",
    imports: [Button, Select, CommonModule, Title, Input, Checkbox],
    templateUrl: "./gallery.html",
    styleUrl: "./gallery.css"
})
export class Gallery implements OnInit {
    protected gallery: WritableSignal<GalleryType[]> = signal([]);

    protected isGalleryActive: WritableSignal<"ALL" | "ACTIVE" | "INACTIVE"> = signal("ALL");

    protected isGalleryOrderChanging: WritableSignal<boolean> = signal(false);

    protected isAddingGalleryPage: WritableSignal<boolean> = signal(false);
    protected isEditingGalleryPage: WritableSignal<boolean> = signal(false);

    protected galleryPagePopupTitle: WritableSignal<string> = signal("Додати сторінку галереї");

    protected galleryPageImage: WritableSignal<File | undefined> = signal(undefined);
    protected galleryPageImageKey: WritableSignal<string> = signal("");
    protected galleryPageImagePreview: WritableSignal<string> = signal("");
    protected galleryPageTitle: WritableSignal<string> = signal("");
    protected galleryPageDescription: WritableSignal<string> = signal("");
    protected galleryPageIsActive: WritableSignal<boolean> = signal(true);
    protected galleryPageId: WritableSignal<string> = signal("");

    protected isPopupSaveButtonDisabled: WritableSignal<boolean> = signal(false);

    private fileInput: Signal<ElementRef<HTMLInputElement>> = viewChild.required("fileInput");

    private galleryService: GalleryService = inject(GalleryService);
    private messageService: MessageService = inject(MessageService);

    ngOnInit(): void {
        this.loadGallery();
    }

    private loadGallery(): void {
        this.galleryService.getAdminGalleryPages(this.isGalleryActive())
            .then((response: GalleryType[]) => {
                this.gallery.set(response);
                this.isGalleryOrderChanging.set(false);
            });
    }

    protected filterGalleryPages(): void {
        this.loadGallery();
    }

    protected addGalleryPage(): void {
        this.galleryPagePopupTitle.set("Додати сторінку галереї");
        this.isPopupSaveButtonDisabled.set(false);
        this.isAddingGalleryPage.set(true);
    }

    protected closeGalleryPopup(): void {
        this.isAddingGalleryPage.set(false);
        this.isEditingGalleryPage.set(false);
        this.clearForm();
    }

    protected onImageSelected(event: Event): void {
        const file: File | undefined = (event.target as HTMLInputElement).files?.[0];

        this.galleryPageImage.set(file);

        if (file) {
            const currentPreview: string = this.galleryPageImagePreview();
            if (currentPreview && currentPreview.startsWith("blob:")) {
                URL.revokeObjectURL(currentPreview);
            }

            this.galleryPageImagePreview.set(URL.createObjectURL(file));
        }
        else {
            this.galleryPageImagePreview.set("");
        }
    }

    protected saveNewGalleryPage(): void {
        if (this.galleryPageImagePreview().trim() == "") {
            this.messageService.showMessage("error", "Помилка вводу", "Зображення є обов'язковим.");
            return;
        }

        if (this.galleryPageTitle().trim() == "") {
            this.messageService.showMessage("error", "Помилка вводу", "Заголовок введенно некоректно.");
            return;
        }

        if (this.galleryPageDescription().trim() == "") {
            this.messageService.showMessage("error", "Помилка вводу", "Опис введенно некоректно.");
            return;
        }

        this.isPopupSaveButtonDisabled.set(true);

        this.galleryService.uploadImage(this.galleryPageImage()!)
            .then(async (imageKey: string) => {
                return await this.galleryService.addGalleryPage(this.galleryPageTitle(), this.galleryPageDescription(), imageKey);
            })
            .then(() => {
                this.loadGallery();
                this.isAddingGalleryPage.set(false);
                this.clearForm();
            })
            .catch(() => {
                this.messageService.showMessage("error", "Помилка сервера", "Не вдалося додати сторінку галереї. Спробуйте заново.");
            })
            .finally(() => {
                this.isPopupSaveButtonDisabled.set(false);
            });
    }

    protected async saveEditedGalleryPage(): Promise<void> {
        if (this.galleryPageImagePreview().trim() == "") {
            this.messageService.showMessage("error", "Помилка вводу", "Зображення є обов'язковим.");
            return;
        }

        if (this.galleryPageTitle().trim() == "") {
            this.messageService.showMessage("error", "Помилка вводу", "Заголовок введенно некоректно.");
            return;
        }

        if (this.galleryPageDescription().trim() == "") {
            this.messageService.showMessage("error", "Помилка вводу", "Опис введенно некоректно.");
            return;
        }

        this.isPopupSaveButtonDisabled.set(true);

        try {
            let imageKey: string | undefined = undefined;

            const galleryPageImage: File | undefined = this.galleryPageImage();
            if (galleryPageImage) {
                imageKey = await this.galleryService.uploadImage(galleryPageImage);
            }

            await this.galleryService.updateGalleryPage(this.galleryPageId(), this.galleryPageTitle(), this.galleryPageDescription(), this.galleryPageIsActive(), imageKey);

            this.loadGallery();
            this.isEditingGalleryPage.set(false);
            this.clearForm();
        }
        catch {
            this.messageService.showMessage("error", "Помилка сервера", "Не вдалося зберегти відредаговану сторінку галереї. Спробуйте заново.");
        }
        finally {
            this.isPopupSaveButtonDisabled.set(false);
        }
    }

    private clearForm(): void {
        this.galleryPageTitle.set("");
        this.galleryPageDescription.set("");
        this.galleryPageImage.set(undefined);
        this.galleryPageImageKey.set("");
        this.galleryPageIsActive.set(true);
        this.galleryPageId.set("");

        const currentPreview: string = this.galleryPageImagePreview();
        if (currentPreview && currentPreview.startsWith("blob:")) {
            URL.revokeObjectURL(currentPreview);
        }

        this.galleryPageImagePreview.set("");

        if (this.fileInput()) {
            this.fileInput().nativeElement.value = "";
        }
    }

    protected moveGalleryPageUp(pageId: string): void {
        this.isGalleryOrderChanging.set(true);

        this.galleryService.updateGalleryPageOrder(pageId, "UP")
            .then(() => {
                this.loadGallery();
            })
            .catch(() => {
                this.messageService.showMessage("error", "Помилка сервера", "Не вдалося змінити порядок сторінки галереї. Спробуйте заново.");
            });
    }

    protected moveGalleryPageDown(pageId: string): void {
        this.isGalleryOrderChanging.set(true);

        this.galleryService.updateGalleryPageOrder(pageId, "DOWN")
            .then(() => {
                this.loadGallery();
            })
            .catch(() => {
                this.messageService.showMessage("error", "Помилка сервера", "Не вдалося змінити порядок сторінки галереї. Спробуйте заново.");
            });
    }

    protected isPageFirst(pageId: string): boolean {
        return this.gallery()[0].id === pageId;
    }

    protected isPageLast(pageId: string): boolean {
        return this.gallery()[this.gallery().length - 1].id === pageId;
    }

    protected editGalleryPage(pageId: string): void {
        this.galleryPagePopupTitle.set("Редагувати сторінку галереї");

        const page: GalleryType | undefined = this.gallery().find((galleryPage: GalleryType) => galleryPage.id === pageId);
        if (!page) {
            this.messageService.showMessage("error", "Помилка вводу", "Сторінку галереї не знайдено.");
            return;
        }

        this.galleryPageTitle.set(page.title);
        this.galleryPageDescription.set(page.description);
        this.galleryPageImagePreview.set(page.image);
        this.galleryPageIsActive.set(page.isActive);
        this.galleryPageId.set(page.id);

        this.isPopupSaveButtonDisabled.set(false);
        this.isEditingGalleryPage.set(true);
    }

    protected deleteGalleryPage(pageId: string): void {
        this.galleryService.deleteGalleryPage(pageId)
            .then(() => {
                this.loadGallery();
            })
            .catch(() => {
                this.messageService.showMessage("error", "Помилка сервера", "Не вдалося видалити сторінку галереї. Спробуйте заново.");
            });
    }
}