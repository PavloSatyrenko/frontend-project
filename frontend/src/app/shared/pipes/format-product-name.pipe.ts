import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "formatProductName",
    standalone: true
})
export class FormatProductNamePipe implements PipeTransform {
    transform(value: string): string {
        if (!value) return "";
        return value.replace(/\//g, "/\u200B");
    }
}
