import { RouterOutlet } from '@angular/router';
import { Component } from "@angular/core";
import { Menu } from "@components/admin/menu/menu";

@Component({
    selector: "page-admin",
    imports: [RouterOutlet, Menu],
    templateUrl: "./admin.html",
    styleUrl: "./admin.css"
})
export class Admin {

}