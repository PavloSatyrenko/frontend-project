import { Component } from "@angular/core";
import { Logo } from "@shared/components/logo/logo";
import { RouterOutlet } from "@angular/router";

@Component({
    template: "page-auth",
    imports: [Logo, RouterOutlet],
    templateUrl: "./auth.html",
    styleUrl: "./auth.css"
})
export class Auth {

}