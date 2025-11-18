import {
    AfterViewInit,
    Component,
    computed,
    ElementRef,
    inject,
    OnInit,
    QueryList,
    Signal,
    signal,
    ViewChildren,
    WritableSignal,
} from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { Link } from "@shared/components/link/link";
import { Title } from "@shared/components/title/title";
import { CategoriesService } from "@shared/services/categories.service";
import { MessageService } from "@shared/services/message.service";
import { CategoryType } from "@shared/types/CategoryType";
import { Button } from "@shared/components/button/button";

type ExtendedCategoryType = CategoryType & {
    imageName: string | null;
    fragment: string | null;
    extended: boolean;
};

@Component({
    selector: "app-category-list",
    imports: [Title, RouterLink, Link, Button],
    templateUrl: "./category-list.html",
    styleUrl: "./category-list.css",
})
export class CategoryList implements OnInit, AfterViewInit {
    protected categories: WritableSignal<ExtendedCategoryType[]> = signal<ExtendedCategoryType[]>([]);

    @ViewChildren("categoryItem") categoryItems!: QueryList<ElementRef<HTMLDivElement>>;

    private categoriesService: CategoriesService = inject(CategoriesService);
    private messageService: MessageService = inject(MessageService);
    private router: Router = inject(Router);

    ngOnInit() {
        this.categoriesService
            .getAllCategories()
            .then((categories: CategoryType[]) => {
                this.categories.set(
                    categories.map((category: CategoryType) => {
                        const updatedCategory: ExtendedCategoryType = {
                            ...category,
                            imageName: null,
                            fragment: null,
                            extended: false,
                        };

                        switch (updatedCategory.name) {
                            case "Аксесуари":
                                updatedCategory.imageName = "category accessories";
                                updatedCategory.fragment = "accessories";
                                break;

                            case "Інструменти":
                                updatedCategory.imageName = "category tools";
                                updatedCategory.fragment = "tools";
                                break;

                            case "Акумулятори":
                                updatedCategory.imageName = "category acum";
                                updatedCategory.fragment = "accumulators";
                                break;

                            case "Масла":
                                updatedCategory.imageName = "category oil";
                                updatedCategory.fragment = "oils";
                                break;

                            case "Спеціальні рідини":
                                updatedCategory.imageName = "category liquids";
                                updatedCategory.fragment = "liquids";
                                break;

                            case "Автохімія":
                                updatedCategory.imageName = "category chemics";
                                updatedCategory.fragment = "chemicals";
                                break;

                            default:
                                break;
                        }

                        return updatedCategory;
                    })
                );
            })
            .catch((error) => {
                console.error(error);
                this.messageService.showMessage(
                    "error",
                    "Помилка",
                    "Сталась помилка: категорії не знайдено, спробуйте перезавантажити сторінку."
                );
            });
    }

    ngAfterViewInit(): void {
        this.categoryItems.changes.subscribe(() => {
            this.scrollToFragment();
        });
    }

    private scrollToFragment(): void {
        if (this.router.url.split("#").length > 1) {
            const fragment = this.router.url.split("#")[1];

            const elRef = this.categoryItems.find((el) => {
                return el.nativeElement.id == fragment;
            });

            if (elRef) {
                elRef.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }

    protected extendCategory(categoryId: string): void {
        this.categories.update((prevCategories: ExtendedCategoryType[]) => {
            return prevCategories.map((category: ExtendedCategoryType) => ({
                ...category,
                extended: category.id == categoryId ? !category.extended : category.extended,
            }));
        });
    }
}
