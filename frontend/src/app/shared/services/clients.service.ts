import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal, WritableSignal } from "@angular/core";
import { environment } from "@shared/environments/environment";
import { ClientRequestType } from "@shared/types/ClientRequestType";
import { ClientResponseType } from "@shared/types/ClientResponseType";
import { ClientType } from "@shared/types/ClientType";
import { UserRequestType } from "@shared/types/UserRequestType";
import { UserRoleEnum } from "@shared/types/UserRoleEnum";
import { UserType } from "@shared/types/UserType";
import { firstValueFrom, Observable, shareReplay, Subject, Subscriber, Subscription, switchMap, tap } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class ClientsService {
    public clientsRequest: WritableSignal<ClientRequestType> = signal<ClientRequestType>({
        page: 1,
        pageSize: 10,
    });

    public clientsResponse: WritableSignal<ClientResponseType> = signal<ClientResponseType>({
        clients: [],
        totalCount: 0,
        totalPages: 0,
        page: 1,
        pageSize: 10,
    });

    private httpClient: HttpClient = inject(HttpClient);

    private requestSubject = new Subject<{ options: ClientRequestType; hasToUpdateResponse: boolean }>();

    private clients$: Observable<ClientResponseType> = this.requestSubject.pipe(
        switchMap(({ options, hasToUpdateResponse }) =>
            this.httpClient.get<ClientResponseType>(environment.serverURL + "/client", { params: options }).pipe(
                tap((response: ClientResponseType) => {
                    if (hasToUpdateResponse) {
                        this.clientsResponse.set(response);
                    }
                })
            )
        ),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    public async getClients(
        hasToUpdateResponse: boolean = true,
        options: ClientRequestType = this.clientsRequest()
    ): Promise<ClientResponseType> {
        return await firstValueFrom(
            new Observable<ClientResponseType>((subscriber: Subscriber<ClientResponseType>) => {
                const clientsSubscription: Subscription = this.clients$.subscribe(subscriber);
                this.requestSubject.next({ options, hasToUpdateResponse });
                return clientsSubscription;
            })
        );
    }

    public async getPersonalData(): Promise<UserType> {
        return await firstValueFrom<UserType>(this.httpClient.get<UserType>(environment.serverURL + "/client/me"));
    }

    public async updatePersonalData(name: string, surname: string, email: string, phone: string, password: string): Promise<null> {
        const body: UserRequestType = {
            name,
            surname,
            email: email,
            phone,
            password: password === "" ? undefined : password,
        };

        return await firstValueFrom<null>(this.httpClient.put<null>(environment.serverURL + "/client/me", body));
    }

    public async updateClient(
        userId: string,
        userName: string,
        userSurname: string,
        userPhone: string,
        userRole: UserRoleEnum,
        userDiscount: number,
        userEmail?: string
    ): Promise<{ message: string } | null> {
        const body: Omit<ClientType, "id" | "totalOrders"> = {
            name: userName,
            surname: userSurname,
            phone: userPhone,
            email: userEmail,
            role: userRole,
            discount: userDiscount,
        };

        return await firstValueFrom<{ message: string } | null>(
            this.httpClient.put<{ message: string } | null>(environment.serverURL + `/client/${userId}`, body)
        );
    }
}
