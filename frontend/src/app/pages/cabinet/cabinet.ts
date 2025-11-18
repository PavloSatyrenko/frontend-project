import { Component, ElementRef, Signal, signal, viewChild, WritableSignal } from "@angular/core";
import { UserMenu } from "@components/cabinet/user-menu/user-menu";
import { RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";

@Component({
    selector: "page-cabinet",
    imports: [UserMenu, RouterOutlet, CommonModule],
    templateUrl: "./cabinet.html",
    styleUrl: "./cabinet.css",
})
export class CabinetPage {}
