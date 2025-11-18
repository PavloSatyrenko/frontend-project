import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "@shared/services/auth.service";
import { MessageService } from "@shared/services/message.service";
import { UserRoleEnum } from "@shared/types/UserRoleEnum";

export const adminGuard: CanActivateFn = async (route, state) => {
    const authService: AuthService = inject(AuthService);
    const router: Router = inject(Router);
    const messageService: MessageService = inject(MessageService);

    if (!authService.user()) {
        await authService.getAuthorizedUser().catch(() => {
            messageService.showMessage("error", "Помилка", "У вас немає доступу до цієї сторінки.");
            return router.navigate(["/"]);
        });
    }

    if (authService.user()?.role == UserRoleEnum.Admin) {
        return true;
    }

    messageService.showMessage("error", "Помилка", "У вас немає доступу до цієї сторінки.");
    return router.navigate(["/"]);
};
