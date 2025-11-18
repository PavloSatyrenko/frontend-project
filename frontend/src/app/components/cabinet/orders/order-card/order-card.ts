import { CommonModule } from "@angular/common";
import { Component, computed, LOCALE_ID, model, ModelSignal, signal, Signal, WritableSignal } from "@angular/core";
import { OrderStatusEnum } from "@shared/types/OrderStatusEnum";
import { OrderType } from "@shared/types/OrderType";
import { OrderProduct } from "@shared/components/order-product/order-product";
import { DeliveryMethodEnum } from "@shared/types/DeliveryMethodEnum";
import { ProductType } from "@shared/types/ProductType";

@Component({
    selector: "orders-order-card",
    imports: [CommonModule, OrderProduct],
    providers: [{ provide: LOCALE_ID, useValue: "uk-UA" }],
    templateUrl: "./order-card.html",
    styleUrl: "./order-card.css",
})
export class OrderCard {
    public readonly order: ModelSignal<OrderType> = model.required<OrderType>();

    protected readonly isExtended: WritableSignal<boolean> = signal<boolean>(false);

    protected readonly orderExtendedHeight: Signal<string> = computed<string>(
        () => this.order().orderItems.length * 116 + (this.order().orderItems.length - 1) * 16 + 40 + 160 + 206 + "px"
    );

    protected readonly OrderStatusEnum = OrderStatusEnum;
    protected readonly DeliveryMethodEnum = DeliveryMethodEnum;

    protected extendCard(): void {
        this.isExtended.set(!this.isExtended());
    }

    protected getProductImageUrl(product: ProductType): string {
        return product.image.length ? product.image[0] : "assets/product.png";
    }
}
