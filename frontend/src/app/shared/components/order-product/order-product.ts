import { CommonModule } from "@angular/common";
import { Component, computed, model, ModelSignal, Signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormatProductNamePipe } from "@shared/pipes/format-product-name.pipe";
import { OrderProductType } from "@shared/types/OrderProductType";
import { ProductType } from "@shared/types/ProductType";

@Component({
    selector: "ui-order-product",
    imports: [RouterLink, FormatProductNamePipe, CommonModule],
    templateUrl: "./order-product.html",
    styleUrl: "./order-product.css",
})
export class OrderProduct {
    public readonly orderItem: ModelSignal<Omit<OrderProductType, "id">> =
        model.required<Omit<OrderProductType, "id">>();

    protected readonly productImageUrl: Signal<string> = computed<string>(() => {
        return this.orderItem().product.image.length ? this.orderItem().product.image[0] : "assets/product.png";
    });

    protected readonly orderItemTotalPrice: Signal<number> = computed<number>(() => {
        return this.orderItem().priceOut ?? this.discountedPrice(this.orderItem().product) * this.orderItem().amount;
    });

    protected discountedPrice(product: ProductType): number {
        return product.price * (1 - product.discount / 100);
    }
}
